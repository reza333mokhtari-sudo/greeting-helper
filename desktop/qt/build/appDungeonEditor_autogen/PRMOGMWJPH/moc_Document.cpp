/****************************************************************************
** Meta object code from reading C++ file 'Document.h'
**
** Created by: The Qt Meta Object Compiler version 69 (Qt 6.10.1)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "../../../src/core/Document.h"
#include <QtCore/qmetatype.h>

#include <QtCore/qtmochelpers.h>

#include <memory>


#include <QtCore/qxptype_traits.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'Document.h' doesn't include <QObject>."
#elif Q_MOC_OUTPUT_REVISION != 69
#error "This file was generated using the moc from 6.10.1. It"
#error "cannot be used with the include files from this version of Qt."
#error "(The moc has changed too much.)"
#endif

#ifndef Q_CONSTINIT
#define Q_CONSTINIT
#endif

QT_WARNING_PUSH
QT_WARNING_DISABLE_DEPRECATED
QT_WARNING_DISABLE_GCC("-Wuseless-cast")
namespace {
struct qt_meta_tag_ZN8DocumentE_t {};
} // unnamed namespace

template <> constexpr inline auto Document::qt_create_metaobjectdata<qt_meta_tag_ZN8DocumentE_t>()
{
    namespace QMC = QtMocConstants;
    QtMocHelpers::StringRefStorage qt_stringData {
        "Document",
        "QML.Element",
        "auto",
        "objectsChanged",
        "",
        "canUndoChanged",
        "canRedoChanged",
        "dirtyChanged",
        "gridVisibleChanged",
        "snapEnabledChanged",
        "floorsChanged",
        "layersChanged",
        "addFloor",
        "name",
        "toggleLayer",
        "visible",
        "addObject",
        "QJsonObject",
        "obj",
        "updateObject",
        "id",
        "props",
        "removeObject",
        "clear",
        "save",
        "url",
        "load",
        "objects",
        "QJsonArray",
        "undoStack",
        "QUndoStack*",
        "canUndo",
        "canRedo",
        "dirty",
        "gridVisible",
        "snapEnabled",
        "floors"
    };

    QtMocHelpers::UintData qt_methods {
        // Signal 'objectsChanged'
        QtMocHelpers::SignalData<void()>(3, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'canUndoChanged'
        QtMocHelpers::SignalData<void()>(5, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'canRedoChanged'
        QtMocHelpers::SignalData<void()>(6, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'dirtyChanged'
        QtMocHelpers::SignalData<void()>(7, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'gridVisibleChanged'
        QtMocHelpers::SignalData<void()>(8, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'snapEnabledChanged'
        QtMocHelpers::SignalData<void()>(9, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'floorsChanged'
        QtMocHelpers::SignalData<void()>(10, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'layersChanged'
        QtMocHelpers::SignalData<void()>(11, 4, QMC::AccessPublic, QMetaType::Void),
        // Method 'addFloor'
        QtMocHelpers::MethodData<void(const QString &)>(12, 4, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 13 },
        }}),
        // Method 'toggleLayer'
        QtMocHelpers::MethodData<void(const QString &, bool)>(14, 4, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 13 }, { QMetaType::Bool, 15 },
        }}),
        // Method 'addObject'
        QtMocHelpers::MethodData<void(QJsonObject)>(16, 4, QMC::AccessPublic, QMetaType::Void, {{
            { 0x80000000 | 17, 18 },
        }}),
        // Method 'updateObject'
        QtMocHelpers::MethodData<void(const QString &, QJsonObject)>(19, 4, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 20 }, { 0x80000000 | 17, 21 },
        }}),
        // Method 'removeObject'
        QtMocHelpers::MethodData<void(const QString &)>(22, 4, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 20 },
        }}),
        // Method 'clear'
        QtMocHelpers::MethodData<void()>(23, 4, QMC::AccessPublic, QMetaType::Void),
        // Method 'save'
        QtMocHelpers::MethodData<void(const QString &)>(24, 4, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 25 },
        }}),
        // Method 'load'
        QtMocHelpers::MethodData<void(const QString &)>(26, 4, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 25 },
        }}),
    };
    QtMocHelpers::UintData qt_properties {
        // property 'objects'
        QtMocHelpers::PropertyData<QJsonArray>(27, 0x80000000 | 28, QMC::DefaultPropertyFlags | QMC::EnumOrFlag, 0),
        // property 'undoStack'
        QtMocHelpers::PropertyData<QUndoStack*>(29, 0x80000000 | 30, QMC::DefaultPropertyFlags | QMC::EnumOrFlag | QMC::Constant),
        // property 'canUndo'
        QtMocHelpers::PropertyData<bool>(31, QMetaType::Bool, QMC::DefaultPropertyFlags, 1),
        // property 'canRedo'
        QtMocHelpers::PropertyData<bool>(32, QMetaType::Bool, QMC::DefaultPropertyFlags, 2),
        // property 'dirty'
        QtMocHelpers::PropertyData<bool>(33, QMetaType::Bool, QMC::DefaultPropertyFlags, 3),
        // property 'gridVisible'
        QtMocHelpers::PropertyData<bool>(34, QMetaType::Bool, QMC::DefaultPropertyFlags | QMC::Writable | QMC::StdCppSet, 4),
        // property 'snapEnabled'
        QtMocHelpers::PropertyData<bool>(35, QMetaType::Bool, QMC::DefaultPropertyFlags | QMC::Writable | QMC::StdCppSet, 5),
        // property 'floors'
        QtMocHelpers::PropertyData<QJsonArray>(36, 0x80000000 | 28, QMC::DefaultPropertyFlags | QMC::EnumOrFlag, 6),
        // property 'floors'
        QtMocHelpers::PropertyData<QJsonArray>(36, 0x80000000 | 28, QMC::DefaultPropertyFlags | QMC::EnumOrFlag, 7),
    };
    QtMocHelpers::UintData qt_enums {
    };
    QtMocHelpers::UintData qt_constructors {};
    QtMocHelpers::ClassInfos qt_classinfo({
            {    1,    2 },
    });
    return QtMocHelpers::metaObjectData<Document, void>(QMC::MetaObjectFlag{}, qt_stringData,
            qt_methods, qt_properties, qt_enums, qt_constructors, qt_classinfo);
}
Q_CONSTINIT const QMetaObject Document::staticMetaObject = { {
    QMetaObject::SuperData::link<QObject::staticMetaObject>(),
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN8DocumentE_t>.stringdata,
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN8DocumentE_t>.data,
    qt_static_metacall,
    nullptr,
    qt_staticMetaObjectRelocatingContent<qt_meta_tag_ZN8DocumentE_t>.metaTypes,
    nullptr
} };

void Document::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    auto *_t = static_cast<Document *>(_o);
    if (_c == QMetaObject::InvokeMetaMethod) {
        switch (_id) {
        case 0: _t->objectsChanged(); break;
        case 1: _t->canUndoChanged(); break;
        case 2: _t->canRedoChanged(); break;
        case 3: _t->dirtyChanged(); break;
        case 4: _t->gridVisibleChanged(); break;
        case 5: _t->snapEnabledChanged(); break;
        case 6: _t->floorsChanged(); break;
        case 7: _t->layersChanged(); break;
        case 8: _t->addFloor((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 9: _t->toggleLayer((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1])),(*reinterpret_cast<std::add_pointer_t<bool>>(_a[2]))); break;
        case 10: _t->addObject((*reinterpret_cast<std::add_pointer_t<QJsonObject>>(_a[1]))); break;
        case 11: _t->updateObject((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1])),(*reinterpret_cast<std::add_pointer_t<QJsonObject>>(_a[2]))); break;
        case 12: _t->removeObject((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 13: _t->clear(); break;
        case 14: _t->save((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 15: _t->load((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        default: ;
        }
    }
    if (_c == QMetaObject::IndexOfMethod) {
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::objectsChanged, 0))
            return;
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::canUndoChanged, 1))
            return;
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::canRedoChanged, 2))
            return;
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::dirtyChanged, 3))
            return;
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::gridVisibleChanged, 4))
            return;
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::snapEnabledChanged, 5))
            return;
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::floorsChanged, 6))
            return;
        if (QtMocHelpers::indexOfMethod<void (Document::*)()>(_a, &Document::layersChanged, 7))
            return;
    }
    if (_c == QMetaObject::RegisterPropertyMetaType) {
        switch (_id) {
        default: *reinterpret_cast<int*>(_a[0]) = -1; break;
        case 1:
            *reinterpret_cast<int*>(_a[0]) = qRegisterMetaType< QUndoStack* >(); break;
        }
    }
    if (_c == QMetaObject::ReadProperty) {
        void *_v = _a[0];
        switch (_id) {
        case 0: *reinterpret_cast<QJsonArray*>(_v) = _t->objects(); break;
        case 1: *reinterpret_cast<QUndoStack**>(_v) = _t->undoStack(); break;
        case 2: *reinterpret_cast<bool*>(_v) = _t->canUndo(); break;
        case 3: *reinterpret_cast<bool*>(_v) = _t->canRedo(); break;
        case 4: *reinterpret_cast<bool*>(_v) = _t->dirty(); break;
        case 5: *reinterpret_cast<bool*>(_v) = _t->gridVisible(); break;
        case 6: *reinterpret_cast<bool*>(_v) = _t->snapEnabled(); break;
        case 7: *reinterpret_cast<QJsonArray*>(_v) = _t->floors(); break;
        case 8: *reinterpret_cast<QJsonArray*>(_v) = _t->layers(); break;
        default: break;
        }
    }
    if (_c == QMetaObject::WriteProperty) {
        void *_v = _a[0];
        switch (_id) {
        case 5: _t->setGridVisible(*reinterpret_cast<bool*>(_v)); break;
        case 6: _t->setSnapEnabled(*reinterpret_cast<bool*>(_v)); break;
        default: break;
        }
    }
}

const QMetaObject *Document::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *Document::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_staticMetaObjectStaticContent<qt_meta_tag_ZN8DocumentE_t>.strings))
        return static_cast<void*>(this);
    return QObject::qt_metacast(_clname);
}

int Document::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QObject::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 16)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 16;
    }
    if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 16)
            *reinterpret_cast<QMetaType *>(_a[0]) = QMetaType();
        _id -= 16;
    }
    if (_c == QMetaObject::ReadProperty || _c == QMetaObject::WriteProperty
            || _c == QMetaObject::ResetProperty || _c == QMetaObject::BindableProperty
            || _c == QMetaObject::RegisterPropertyMetaType) {
        qt_static_metacall(this, _c, _id, _a);
        _id -= 9;
    }
    return _id;
}

// SIGNAL 0
void Document::objectsChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 0, nullptr);
}

// SIGNAL 1
void Document::canUndoChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 1, nullptr);
}

// SIGNAL 2
void Document::canRedoChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 2, nullptr);
}

// SIGNAL 3
void Document::dirtyChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 3, nullptr);
}

// SIGNAL 4
void Document::gridVisibleChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 4, nullptr);
}

// SIGNAL 5
void Document::snapEnabledChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 5, nullptr);
}

// SIGNAL 6
void Document::floorsChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 6, nullptr);
}

// SIGNAL 7
void Document::layersChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 7, nullptr);
}
QT_WARNING_POP
