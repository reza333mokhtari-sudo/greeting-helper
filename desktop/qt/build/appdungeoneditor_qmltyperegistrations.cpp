/****************************************************************************
** Generated QML type registration code
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include <QtQml/qqml.h>
#include <QtQml/qqmlmoduleregistration.h>

#if __has_include(<AiClient.h>)
#  include <AiClient.h>
#endif
#if __has_include(<AssetLibraryModel.h>)
#  include <AssetLibraryModel.h>
#endif
#if __has_include(<Document.h>)
#  include <Document.h>
#endif
#if __has_include(<FileService.h>)
#  include <FileService.h>
#endif
#if __has_include(<MapCanvasItem.h>)
#  include <MapCanvasItem.h>
#endif


#if !defined(QT_STATIC)
#define Q_QMLTYPE_EXPORT Q_DECL_EXPORT
#else
#define Q_QMLTYPE_EXPORT
#endif
Q_QMLTYPE_EXPORT void qml_register_types_DungeonEditor()
{
    QT_WARNING_PUSH QT_WARNING_DISABLE_DEPRECATED
    qmlRegisterTypesAndRevisions<AiClient>("DungeonEditor", 1);
    qmlRegisterTypesAndRevisions<AssetLibraryModel>("DungeonEditor", 1);
    qmlRegisterTypesAndRevisions<Document>("DungeonEditor", 1);
    qmlRegisterTypesAndRevisions<FileService>("DungeonEditor", 1);
    qmlRegisterTypesAndRevisions<MapCanvasItem>("DungeonEditor", 1);
    qmlRegisterAnonymousType<QQuickItem, 254>("DungeonEditor", 1);
    QMetaType::fromType<QAbstractItemModel *>().id();
    qmlRegisterEnum<QAbstractItemModel::LayoutChangeHint>("QAbstractItemModel::LayoutChangeHint");
    qmlRegisterEnum<QAbstractItemModel::CheckIndexOption>("QAbstractItemModel::CheckIndexOption");
    QMetaType::fromType<QAbstractListModel *>().id();
    QT_WARNING_POP
    qmlRegisterModule("DungeonEditor", 1, 0);
}

static const QQmlModuleRegistration dungeonEditorRegistration("DungeonEditor", qml_register_types_DungeonEditor);
