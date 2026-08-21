#include <QApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QIcon>
#include <QQuickStyle>
#include <QQuickWindow>
#include <QSettings>
#include <QtQml/qqml.h>
#include <QDebug>
#include <QLibrary>
#include <QSurfaceFormat>

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
 * SKILLS
 * - Map editor architect (Tiled patterns)
 * - React/TypeScript editor implementer
 * - Qt/QML pattern mirror for desktop/qt
 * - Debugger: small fixes, no rewrites
 * - UI/UX for dense DCC tools
 *
 * Also mirror the same patterns into desktop/qt where applicable.
 *
 * GOAL
 * Unstick the product and make the editor reliable using Tiled-style architecture.
 */

#ifdef Q_OS_WIN
#include <windows.h>
#endif

// We include the headers but the implementation is linked from core.dll
#include <core/Document.h>
#include <canvas/MapCanvasItem.h>
#include <models/AssetLibraryModel.h>
#include <services/AiClient.h>
#include <services/FileService.h>
#include <services/WorkspaceService.h>
#include <services/LicenseService.h>

static WorkspaceService* globalWorkspaceService = nullptr;

void myMessageHandler(QtMsgType type, const QMessageLogContext &context, const QString &msg)
{
    if (!globalWorkspaceService) return;
    
    QString level = "info";
    switch (type) {
    case QtDebugMsg: level = "debug"; break;
    case QtWarningMsg: level = "warning"; break;
    case QtCriticalMsg: level = "critical"; break;
    case QtFatalMsg: level = "fatal"; break;
    case QtInfoMsg: level = "info"; break;
    }
    
    QString logMsg = msg;
    if (context.file) {
        logMsg += QString(" (%1:%2)").arg(context.file).arg(context.line);
    }
    
    globalWorkspaceService->logMessage(logMsg, level);
}

int main(int argc, char *argv[])
{
    // Professional DCC initialization
    QApplication app(argc, argv);
    app.setOrganizationName("DungeonEditor");
    app.setApplicationName("DungeonEditorNative");
    app.setWindowIcon(QIcon(":/qt/qml/DungeonEditor/assets/icon.png"));

    // Force Fusion style for ZBrush/Maya aesthetic
    QQuickStyle::setStyle("Fusion");

    // Initialize global workspace service for logging
    globalWorkspaceService = new WorkspaceService();
    qInstallMessageHandler(myMessageHandler);

    // Register types
    qmlRegisterType<Document>("DungeonEditor.Core", 1, 0, "Document");
    qmlRegisterType<MapCanvasItem>("DungeonEditor.Canvas", 1, 0, "MapCanvasItem");
    qmlRegisterType<AssetLibraryModel>("DungeonEditor.Models", 1, 0, "AssetLibraryModel");
    
    // Provide the existing instance for the singleton-like service if needed, 
    // but here we just register the type and can also set it as a context property.
    qmlRegisterType<WorkspaceService>("DungeonEditor.Services", 1, 0, "WorkspaceService");
    
    qmlRegisterType<AiClient>("DungeonEditor.Services", 1, 0, "AiClient");
    qmlRegisterType<LicenseService>("DungeonEditor.Services", 1, 0, "LicenseService");
    qmlRegisterType<FileService>("DungeonEditor.Services", 1, 0, "FileService");

    QQmlApplicationEngine engine;
    engine.rootContext()->setContextProperty("workspaceService", globalWorkspaceService);
    
    
    // Internal resource paths for bundled QML
    engine.addImportPath("qrc:/qt/qml");
    engine.addImportPath("qrc:/");

    const QUrl url("qrc:/qt/qml/DungeonEditor/qml/Main.qml");
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
        if (!obj && url == objUrl)
            QCoreApplication::exit(-1);
    }, Qt::DirectConnection);
    
    engine.load(url);

    return app.exec();
}
