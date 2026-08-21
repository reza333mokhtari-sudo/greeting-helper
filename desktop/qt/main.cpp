#include <QApplication>
#include <QMainWindow>
#include <QWebEngineView>
#include <QUrl>
#include <QVBoxLayout>
#include <QWidget>
#include <QStatusBar>
#include <QMenuBar>
#include <QMenu>
#include <QAction>
#include <QIcon>
#include <QDebug>
#include <QWebEngineProfile>
#include <QWebEngineSettings>
#include <QFileSystemWatcher>
#include <QDir>
#include <QTimer>
#include <QSettings>
#include <QQuickWindow>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *                                        
 *                                            
 *                                            Also mirror the same patterns into desktop/qt where applicable
 *
 * ## PROMPT بازنویسی‌شده (ضد گیر کردن + Tiled-first + Desktop mirror)
 *
 * این نسخه برای Lovable کوتاه‌تر از مقاله، ولی دقیق است؛ کار را **تکه‌تکه** می‌کند تا fail/hang ندهد.
 *
 * /developerMode
 *
 * Also mirror the same patterns into desktop/qt where applicable.
 */

class GreetingHelperWindow : public QMainWindow {
    Q_OBJECT

public:
    GreetingHelperWindow(QWidget *parent = nullptr) : QMainWindow(parent) {
        setWindowTitle("Greeting Helper - Dungeon Scrawl Desktop");
        setMinimumSize(1280, 800);

        // Setup WebView
        m_view = new QWebEngineView(this);

        // Optimize for editor performance
        m_view->settings()->setAttribute(QWebEngineSettings::Accelerated2dCanvasEnabled, true);
        m_view->settings()->setAttribute(QWebEngineSettings::WebGLEnabled, true);
        m_view->settings()->setAttribute(QWebEngineSettings::LocalStorageEnabled, true);

        // Load the application
        m_view->setUrl(QUrl("http://localhost:8080"));

        setCentralWidget(m_view);

        // Native Menus
        createMenus();

        statusBar()->showMessage(QString("Ready (Backend: %1)").arg(getCurrentGraphicsApiName()));

        connect(m_view, &QWebEngineView::loadFinished, this, [this](bool ok) {
            if (ok) statusBar()->showMessage("System Online", 3000);
            else statusBar()->showMessage("Connection Failed - Ensure Vite is running", 0);
        });

        setupDevMode();
    }

private:
    QString getCurrentGraphicsApiName() {
        QSettings settings;
        return settings.value("graphicsApi", "Auto").toString();
    }

    void setupDevMode() {
        m_watcher = new QFileSystemWatcher(this);
        QString projectPath = QDir::currentPath();
        m_watcher->addPath(projectPath + "/src");

        m_reloadTimer = new QTimer(this);
        m_reloadTimer->setSingleShot(true);
        m_reloadTimer->setInterval(500);

        connect(m_watcher, &QFileSystemWatcher::directoryChanged, this, [this](const QString &path) {
            qDebug() << "Change detected in:" << path;
            m_reloadTimer->start();
        });

        connect(m_reloadTimer, &QTimer::timeout, this, [this]() {
            statusBar()->showMessage("Source changed, reloading...", 2000);
            m_view->reload();
        });
    }

    void createMenus() {
        QMenu *fileMenu = menuBar()->addMenu("&File");

        QMenu *graphicsMenu = fileMenu->addMenu("Graphics Backend (Restart Required)");
        QStringList apis = {"Auto", "OpenGL", "Vulkan", "Metal", "Direct3D11"};
        QString current = getCurrentGraphicsApiName();

        for (const QString &api : apis) {
            QAction *act = graphicsMenu->addAction(api);
            act->setCheckable(true);
            act->setChecked(api == current);
            connect(act, &QAction::triggered, this, [this, api]() {
                QSettings settings;
                settings.setValue("graphicsApi", api);
                statusBar()->showMessage("Graphics API set to " + api + ". Please restart the application.", 5000);
            });
        }

        fileMenu->addSeparator();
        QAction *exitAct = fileMenu->addAction("E&xit");
        connect(exitAct, &QAction::triggered, this, &QWidget::close);

        QMenu *viewMenu = menuBar()->addMenu("&View");
        QAction *reloadAct = viewMenu->addAction("&Reload");
        connect(reloadAct, &QAction::triggered, m_view, &QWebEngineView::reload);

        QAction *devToolsAct = viewMenu->addAction("Toggle &DevTools");
        connect(devToolsAct, &QAction::triggered, this, [this]() {
            qDebug() << "DevTools requested";
        });
    }

    QWebEngineView *m_view;
    QFileSystemWatcher *m_watcher;
    QTimer *m_reloadTimer;
};

void applyGraphicsApi() {
    QSettings settings;
    QString api = settings.value("graphicsApi", "Auto").toString();

    if (api == "OpenGL") QQuickWindow::setGraphicsApi(QSGRendererInterface::OpenGL);
    else if (api == "Vulkan") QQuickWindow::setGraphicsApi(QSGRendererInterface::Vulkan);
    else if (api == "Metal") QQuickWindow::setGraphicsApi(QSGRendererInterface::Metal);
    else if (api == "Direct3D11") QQuickWindow::setGraphicsApi(QSGRendererInterface::Direct3D11);
    // "Auto" is default, no call needed
}

int main(int argc, char *argv[]) {
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QCoreApplication::setAttribute(Qt::AA_UseHighDpiPixmaps);

    QCoreApplication::setOrganizationName("DungeonScrawl");
    QCoreApplication::setApplicationName("GreetingHelper");

    applyGraphicsApi();

    QApplication app(argc, argv);

    GreetingHelperWindow window;
    window.show();

    return app.exec();
}

#include "main.moc"