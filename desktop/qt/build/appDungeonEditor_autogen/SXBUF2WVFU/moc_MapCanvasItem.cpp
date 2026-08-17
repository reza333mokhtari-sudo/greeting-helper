/****************************************************************************
** Meta object code from reading C++ file 'MapCanvasItem.h'
**
** Created by: The Qt Meta Object Compiler version 69 (Qt 6.10.1)
**
** WARNING! All changes made in this file will be lost!
*****************************************************************************/

#include "../../../src/canvas/MapCanvasItem.h"
#include <QtCore/qmetatype.h>

#include <QtCore/qtmochelpers.h>

#include <memory>


#include <QtCore/qxptype_traits.h>
#if !defined(Q_MOC_OUTPUT_REVISION)
#error "The header file 'MapCanvasItem.h' doesn't include <QObject>."
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
struct qt_meta_tag_ZN13MapCanvasItemE_t {};
} // unnamed namespace

template <> constexpr inline auto MapCanvasItem::qt_create_metaobjectdata<qt_meta_tag_ZN13MapCanvasItemE_t>()
{
    namespace QMC = QtMocConstants;
    QtMocHelpers::StringRefStorage qt_stringData {
        "MapCanvasItem",
        "QML.Element",
        "auto",
        "documentChanged",
        "",
        "activeToolChanged",
        "selectionChanged",
        "id",
        "zoomChanged",
        "panChanged",
        "cursorWorldChanged",
        "QPointF",
        "pos",
        "document",
        "Document*",
        "activeTool",
        "selectedId",
        "zoom",
        "pan",
        "cursorWorldPos"
    };

    QtMocHelpers::UintData qt_methods {
        // Signal 'documentChanged'
        QtMocHelpers::SignalData<void()>(3, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'activeToolChanged'
        QtMocHelpers::SignalData<void()>(5, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'selectionChanged'
        QtMocHelpers::SignalData<void(const QString &)>(6, 4, QMC::AccessPublic, QMetaType::Void, {{
            { QMetaType::QString, 7 },
        }}),
        // Signal 'zoomChanged'
        QtMocHelpers::SignalData<void()>(8, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'panChanged'
        QtMocHelpers::SignalData<void()>(9, 4, QMC::AccessPublic, QMetaType::Void),
        // Signal 'cursorWorldChanged'
        QtMocHelpers::SignalData<void(const QPointF &)>(10, 4, QMC::AccessPublic, QMetaType::Void, {{
            { 0x80000000 | 11, 12 },
        }}),
    };
    QtMocHelpers::UintData qt_properties {
        // property 'document'
        QtMocHelpers::PropertyData<Document*>(13, 0x80000000 | 14, QMC::DefaultPropertyFlags | QMC::Writable | QMC::EnumOrFlag | QMC::StdCppSet, 0),
        // property 'activeTool'
        QtMocHelpers::PropertyData<QString>(15, QMetaType::QString, QMC::DefaultPropertyFlags | QMC::Writable | QMC::StdCppSet, 1),
        // property 'selectedId'
        QtMocHelpers::PropertyData<QString>(16, QMetaType::QString, QMC::DefaultPropertyFlags, 2),
        // property 'zoom'
        QtMocHelpers::PropertyData<double>(17, QMetaType::Double, QMC::DefaultPropertyFlags, 3),
        // property 'pan'
        QtMocHelpers::PropertyData<QPointF>(18, 0x80000000 | 11, QMC::DefaultPropertyFlags | QMC::EnumOrFlag, 4),
        // property 'cursorWorldPos'
        QtMocHelpers::PropertyData<QPointF>(19, 0x80000000 | 11, QMC::DefaultPropertyFlags | QMC::EnumOrFlag, 5),
    };
    QtMocHelpers::UintData qt_enums {
    };
    QtMocHelpers::UintData qt_constructors {};
    QtMocHelpers::ClassInfos qt_classinfo({
            {    1,    2 },
    });
    return QtMocHelpers::metaObjectData<MapCanvasItem, void>(QMC::MetaObjectFlag{}, qt_stringData,
            qt_methods, qt_properties, qt_enums, qt_constructors, qt_classinfo);
}
Q_CONSTINIT const QMetaObject MapCanvasItem::staticMetaObject = { {
    QMetaObject::SuperData::link<QQuickPaintedItem::staticMetaObject>(),
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN13MapCanvasItemE_t>.stringdata,
    qt_staticMetaObjectStaticContent<qt_meta_tag_ZN13MapCanvasItemE_t>.data,
    qt_static_metacall,
    nullptr,
    qt_staticMetaObjectRelocatingContent<qt_meta_tag_ZN13MapCanvasItemE_t>.metaTypes,
    nullptr
} };

void MapCanvasItem::qt_static_metacall(QObject *_o, QMetaObject::Call _c, int _id, void **_a)
{
    auto *_t = static_cast<MapCanvasItem *>(_o);
    if (_c == QMetaObject::InvokeMetaMethod) {
        switch (_id) {
        case 0: _t->documentChanged(); break;
        case 1: _t->activeToolChanged(); break;
        case 2: _t->selectionChanged((*reinterpret_cast<std::add_pointer_t<QString>>(_a[1]))); break;
        case 3: _t->zoomChanged(); break;
        case 4: _t->panChanged(); break;
        case 5: _t->cursorWorldChanged((*reinterpret_cast<std::add_pointer_t<QPointF>>(_a[1]))); break;
        default: ;
        }
    }
    if (_c == QMetaObject::IndexOfMethod) {
        if (QtMocHelpers::indexOfMethod<void (MapCanvasItem::*)()>(_a, &MapCanvasItem::documentChanged, 0))
            return;
        if (QtMocHelpers::indexOfMethod<void (MapCanvasItem::*)()>(_a, &MapCanvasItem::activeToolChanged, 1))
            return;
        if (QtMocHelpers::indexOfMethod<void (MapCanvasItem::*)(const QString & )>(_a, &MapCanvasItem::selectionChanged, 2))
            return;
        if (QtMocHelpers::indexOfMethod<void (MapCanvasItem::*)()>(_a, &MapCanvasItem::zoomChanged, 3))
            return;
        if (QtMocHelpers::indexOfMethod<void (MapCanvasItem::*)()>(_a, &MapCanvasItem::panChanged, 4))
            return;
        if (QtMocHelpers::indexOfMethod<void (MapCanvasItem::*)(const QPointF & )>(_a, &MapCanvasItem::cursorWorldChanged, 5))
            return;
    }
    if (_c == QMetaObject::RegisterPropertyMetaType) {
        switch (_id) {
        default: *reinterpret_cast<int*>(_a[0]) = -1; break;
        case 0:
            *reinterpret_cast<int*>(_a[0]) = qRegisterMetaType< Document* >(); break;
        }
    }
    if (_c == QMetaObject::ReadProperty) {
        void *_v = _a[0];
        switch (_id) {
        case 0: *reinterpret_cast<Document**>(_v) = _t->document(); break;
        case 1: *reinterpret_cast<QString*>(_v) = _t->activeTool(); break;
        case 2: *reinterpret_cast<QString*>(_v) = _t->selectedId(); break;
        case 3: *reinterpret_cast<double*>(_v) = _t->zoom(); break;
        case 4: *reinterpret_cast<QPointF*>(_v) = _t->pan(); break;
        case 5: *reinterpret_cast<QPointF*>(_v) = _t->cursorWorldPos(); break;
        default: break;
        }
    }
    if (_c == QMetaObject::WriteProperty) {
        void *_v = _a[0];
        switch (_id) {
        case 0: _t->setDocument(*reinterpret_cast<Document**>(_v)); break;
        case 1: _t->setActiveTool(*reinterpret_cast<QString*>(_v)); break;
        default: break;
        }
    }
}

const QMetaObject *MapCanvasItem::metaObject() const
{
    return QObject::d_ptr->metaObject ? QObject::d_ptr->dynamicMetaObject() : &staticMetaObject;
}

void *MapCanvasItem::qt_metacast(const char *_clname)
{
    if (!_clname) return nullptr;
    if (!strcmp(_clname, qt_staticMetaObjectStaticContent<qt_meta_tag_ZN13MapCanvasItemE_t>.strings))
        return static_cast<void*>(this);
    return QQuickPaintedItem::qt_metacast(_clname);
}

int MapCanvasItem::qt_metacall(QMetaObject::Call _c, int _id, void **_a)
{
    _id = QQuickPaintedItem::qt_metacall(_c, _id, _a);
    if (_id < 0)
        return _id;
    if (_c == QMetaObject::InvokeMetaMethod) {
        if (_id < 6)
            qt_static_metacall(this, _c, _id, _a);
        _id -= 6;
    }
    if (_c == QMetaObject::RegisterMethodArgumentMetaType) {
        if (_id < 6)
            *reinterpret_cast<QMetaType *>(_a[0]) = QMetaType();
        _id -= 6;
    }
    if (_c == QMetaObject::ReadProperty || _c == QMetaObject::WriteProperty
            || _c == QMetaObject::ResetProperty || _c == QMetaObject::BindableProperty
            || _c == QMetaObject::RegisterPropertyMetaType) {
        qt_static_metacall(this, _c, _id, _a);
        _id -= 6;
    }
    return _id;
}

// SIGNAL 0
void MapCanvasItem::documentChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 0, nullptr);
}

// SIGNAL 1
void MapCanvasItem::activeToolChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 1, nullptr);
}

// SIGNAL 2
void MapCanvasItem::selectionChanged(const QString & _t1)
{
    QMetaObject::activate<void>(this, &staticMetaObject, 2, nullptr, _t1);
}

// SIGNAL 3
void MapCanvasItem::zoomChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 3, nullptr);
}

// SIGNAL 4
void MapCanvasItem::panChanged()
{
    QMetaObject::activate(this, &staticMetaObject, 4, nullptr);
}

// SIGNAL 5
void MapCanvasItem::cursorWorldChanged(const QPointF & _t1)
{
    QMetaObject::activate<void>(this, &staticMetaObject, 5, nullptr, _t1);
}
QT_WARNING_POP
