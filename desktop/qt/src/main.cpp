#include <QApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QIcon>
#include <QQuickStyle>
#include <QQuickWindow>
#include <QSettings>
#include <QtQml/qqml.h>
#include <QDebug>
#include <QProcess>
#include <QSurfaceFormat>
#include <QSGRendererInterface>


#ifdef Q_OS_WIN
#include <windows.h>
#include <shellapi.h>
#endif

#include <core/Document.h>
#include <canvas/MapCanvasItem.h>
#include <models/AssetLibraryModel.h>
#include <services/AiClient.h>
#include <services/FileService.h>
#include <services/WorkspaceService.h>
#include <services/LicenseService.h>

class StyleManager : public QObject {
    Q_OBJECT
    Q_PROPERTY(QString currentStyle READ currentStyle WRITE setCurrentStyle NOTIFY styleChanged)
    Q_PROPERTY(bool isAdmin READ isAdmin CONSTANT)

public:
    explicit StyleManager(QQmlApplicationEngine* engine, QObject *parent = nullptr) 
        : QObject(parent), m_engine(engine) {
        m_currentStyle = QQuickStyle::name();
        if (m_currentStyle.isEmpty()) m_currentStyle = "Fusion";
    }

    Q_INVOKABLE QString activeGraphicsApi() const {
        auto api = QQuickWindow::graphicsApi();
        switch (api) {
            case QSGRendererInterface::OpenGL: return "OpenGL";
            case QSGRendererInterface::Vulkan: return "Vulkan";
            case QSGRendererInterface::Metal: return "Metal";
            case QSGRendererInterface::Direct3D11: return "Direct3D 11";
            case QSGRendererInterface::Software: return "Software";
            default: return "Auto (Let Qt decide)";
        }
    }

    QString currentStyle() const { return m_currentStyle; }
    void setCurrentStyle(const QString& style) {
        if (m_currentStyle != style) {
            m_currentStyle = style;
            emit styleChanged();
        }
    }

    bool isAdmin() const {
#ifdef Q_OS_WIN
        bool isAdmin = false;
        HANDLE hToken = NULL;
        if (OpenProcessToken(GetCurrentProcess(), TOKEN_QUERY, &hToken)) {
            TOKEN_ELEVATION elevation;
            DWORD dwSize;
            if (GetTokenInformation(hToken, TokenElevation, &elevation, sizeof(elevation), &dwSize)) {
                isAdmin = elevation.TokenIsElevated;
            }
        }
        if (hToken) CloseHandle(hToken);
        return isAdmin;
#else
        return geteuid() == 0;
#endif
    }

    Q_INVOKABLE void reloadStyling() {
        qDebug() << "Reloading QML styling for style:" << m_currentStyle;
        
        // In a real DCC app, we'd persist the style choice and restart or 
        // use a dynamic Theme engine. For this debug toggle, we'll suggest restart
        // but QML can also re-evaluate expressions if we notify.
        QQuickStyle::setStyle(m_currentStyle);
        emit styleChanged();
    }

    Q_INVOKABLE void restartApplication() {
        qApp->quit();
        QProcess::startDetached(qApp->arguments()[0], qApp->arguments());
    }

signals:
    void styleChanged();

private:
    QString m_currentStyle;
    QQmlApplicationEngine* m_engine;
};

#include "main.moc"

int main(int argc, char *argv[])
{
    // Early RHI selection before QGuiApplication construction
    {
        QSettings settings("DungeonEditor", "DungeonEditorNative");
        QString backend = settings.value("Graphics/RHIBackend", "Auto").toString();
        
        // Environment variable override
        QByteArray envBackend = qgetenv("QSG_RHI_BACKEND");
        if (!envBackend.isEmpty()) {
            backend = QString::fromLocal8Bit(envBackend);
            qInfo() << "Using QSG_RHI_BACKEND override:" << backend;
        }

        qInfo() << "Target Graphics Backend:" << backend;

        if (backend == "OpenGL") {
            QQuickWindow::setGraphicsApi(QSGRendererInterface::OpenGL);
        } else if (backend == "Vulkan") {
            QQuickWindow::setGraphicsApi(QSGRendererInterface::Vulkan);
        } else if (backend == "Metal") {
#ifdef Q_OS_DARWIN
            QQuickWindow::setGraphicsApi(QSGRendererInterface::Metal);
#else
            qWarning() << "Metal is only supported on macOS. Falling back to Auto.";
#endif
        } else if (backend == "Direct3D 11") {
#ifdef Q_OS_WIN
            QQuickWindow::setGraphicsApi(QSGRendererInterface::Direct3D11);
#else
            qWarning() << "Direct3D 11 is only supported on Windows. Falling back to Auto.";
#endif
        } else if (backend == "Software") {
            QQuickWindow::setGraphicsApi(QSGRendererInterface::Software);
        } else {
            // Auto
        }
    }

    QApplication app(argc, argv);
    app.setOrganizationName("DungeonEditor");
    app.setApplicationName("DungeonEditorNative");

    // Force Fusion style for professional DCC look and to support customization
    QQuickStyle::setStyle("Fusion");

    qmlRegisterType<Document>("DungeonEditor.Core", 1, 0, "Document");
    qmlRegisterType<MapCanvasItem>("DungeonEditor.Canvas", 1, 0, "MapCanvasItem");
    qmlRegisterType<AssetLibraryModel>("DungeonEditor.Models", 1, 0, "AssetLibraryModel");
    qmlRegisterType<WorkspaceService>("DungeonEditor.Services", 1, 0, "WorkspaceService");
    qmlRegisterType<AiClient>("DungeonEditor.Services", 1, 0, "AiClient");
    qmlRegisterType<LicenseService>("DungeonEditor.Services", 1, 0, "LicenseService");
    qmlRegisterType<FileService>("DungeonEditor.Services", 1, 0, "FileService");

    // Standardized QML Component Registration
    qmlRegisterType<Document>("DungeonEditor.Components", 1, 0, "Document");

    // Icon path updated for resource prefix
    app.setWindowIcon(QIcon(":/assets/icon.png"));

    QQmlApplicationEngine engine;
    
    StyleManager styleManager(&engine);
    engine.rootContext()->setContextProperty("styleManager", &styleManager);

    // Register "qml" root correctly for internal imports
    engine.addImportPath("qrc:/");
    engine.addImportPath("qrc:/qml");
    engine.addImportPath("qrc:/qml/components");
    engine.addImportPath("qrc:/qml/dialogs");
    engine.addImportPath("qrc:/qml/panels");


    
    const QStringList resourcePaths = {
        "qrc:/qml/Main.qml"
    };

    bool loaded = false;
    QString executablePath = QCoreApplication::applicationDirPath();
    QString localMain = executablePath + "/qml/Main.qml";
    
    for (const QString &path : resourcePaths) {
        const QUrl url(path);
        
        QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                         &app, [url](QObject *obj, const QUrl &objUrl) {
            if (!obj && url == objUrl) {
                qCritical() << "Engine failed to create object from:" << objUrl;
            }
        }, Qt::DirectConnection);
        
        engine.load(url);
        if (!engine.rootObjects().isEmpty()) {
            loaded = true;
            qDebug() << "Successfully loaded Main.qml from resource path:" << path;
            break;
        }
    }

    if (!loaded) {
        qDebug() << "Resource paths exhausted. Attempting direct URL fallback...";
        QList<QUrl> fallbackUrls = {
            QUrl::fromLocalFile(localMain),
            QUrl::fromLocalFile(executablePath + "/../qml/Main.qml"),
            QUrl::fromLocalFile(executablePath + "/../../qml/Main.qml")
        };
        
        for (const QUrl &url : fallbackUrls) {
            engine.load(url);
            if (!engine.rootObjects().isEmpty()) {
                loaded = true;
                qDebug() << "Successfully loaded Main.qml from direct URL:" << url.toLocalFile();
                break;
            }
        }
    }

    if (!loaded) {
        qCritical() << "Critical: Could not find or load Main.qml in any resource or direct path.";
        return -1;
    }
    
    return app.exec();
}
