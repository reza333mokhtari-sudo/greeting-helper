#include <QGuiApplication>
#include <QQmlApplicationEngine>
#include <QQmlContext>
#include <QtWebEngineQuick/qtwebenginequickglobal.h>
#include "src/core/Document.h"
#include "src/canvas/MapCanvasItem.h"
#include "src/models/AssetLibraryModel.h"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

int main(int argc, char *argv[])
{
    QtWebEngineQuick::initialize();
    
    QGuiApplication app(argc, argv);
    app.setApplicationName("GreetingHelper");
    app.setOrganizationName("DungeonScrawl");

    qmlRegisterType<Document>("DungeonEditor.Core", 1, 0, "Document");
    qmlRegisterType<MapCanvasItem>("DungeonEditor.Canvas", 1, 0, "MapCanvasItem");
    qmlRegisterType<AssetLibraryModel>("DungeonEditor.Models", 1, 0, "AssetLibraryModel");

    QQmlApplicationEngine engine;
    
    Document* doc = new Document(&engine);
    engine.rootContext()->setContextProperty("mapDocument", doc);

    AssetLibraryModel* assetModel = new AssetLibraryModel(&engine);
    assetModel->loadManifest("assets/soulslike/manifest.json");
    engine.rootContext()->setContextProperty("assetModel", assetModel);

    const QUrl url(u"qrc:/DungeonEditor/qml/Main.qml"_qs);
    QObject::connect(&engine, &QQmlApplicationEngine::objectCreated,
                     &app, [url](QObject *obj, const QUrl &objUrl) {
        if (!obj && url == objUrl)
            QCoreApplication::exit(-1);
    }, Qt::QueuedConnection);
    engine.load(url);

    return app.exec();
}

