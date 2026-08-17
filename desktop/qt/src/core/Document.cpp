#include <Document.h>
#include <QFile>
#include <QJsonDocument>
#include <QUndoCommand>
#include <QUuid>
#include <QUrl>

// --- Commands ---

class BaseCommand : public QUndoCommand {
public:
    BaseCommand(const QString &text, std::function<void()> redoFn, std::function<void()> undoFn) 
        : QUndoCommand(text), m_redo(redoFn), m_undo(undoFn) {}
    void redo() override { m_redo(); }
    void undo() override { m_undo(); }
private:
    std::function<void()> m_redo, m_undo;
};

// --- Document ---

Document::Document(QObject *parent) : QObject(parent) {
    m_undoStack = new QUndoStack(this);
    connect(m_undoStack, &QUndoStack::canUndoChanged, this, &Document::canUndoChanged);
    connect(m_undoStack, &QUndoStack::canRedoChanged, this, &Document::canRedoChanged);
    
    // Default data
    QJsonObject f1; f1["id"] = "f1"; f1["name"] = "Ground Floor"; f1["active"] = true;
    m_floors.append(f1);

    QJsonObject l1; l1["name"] = "Props"; l1["isVisible"] = true;
    QJsonObject l2; l2["name"] = "Structure"; l2["isVisible"] = true;
    m_layers.append(l1);
    m_layers.append(l2);
}

void Document::addFloor(const QString& name) {
    QJsonObject f;
    f["id"] = QUuid::createUuid().toString();
    f["name"] = name;
    f["active"] = false;
    m_floors.append(f);
    emit floorsChanged();
}

void Document::toggleLayer(const QString& name, bool visible) {
    for(int i=0; i<m_layers.size(); ++i) {
        QJsonObject l = m_layers[i].toObject();
        if(l["name"].toString() == name) {
            l["isVisible"] = visible;
            m_layers[i] = l;
            break;
        }
    }
    emit layersChanged();
    emit objectsChanged(); // Redraw if layer visibility changes
}

void Document::addObject(QJsonObject obj) {
    if(!obj.contains("id")) obj["id"] = QUuid::createUuid().toString();
    
    auto redo = [this, obj]() { m_objects.append(obj); refresh(); };
    auto undo = [this, id = obj["id"].toString()]() {
        for(int i=0; i<m_objects.size(); ++i) {
            if(m_objects[i].toObject()["id"].toString() == id) {
                m_objects.removeAt(i); break;
            }
        }
        refresh();
    };
    m_undoStack->push(new BaseCommand(tr("Add Object"), redo, undo));
}

void Document::updateObject(const QString& id, QJsonObject props) {
    QJsonObject oldProps;
    int idx = -1;
    for(int i=0; i<m_objects.size(); ++i) {
        if(m_objects[i].toObject()["id"].toString() == id) {
            idx = i;
            QJsonObject current = m_objects[i].toObject();
            for(auto it = props.begin(); it != props.end(); ++it) {
                oldProps[it.key()] = current[it.key()];
            }
            break;
        }
    }
    if(idx == -1) return;

    auto redo = [this, id, props]() {
        for(int i=0; i<m_objects.size(); ++i) {
            QJsonObject o = m_objects[i].toObject();
            if(o["id"].toString() == id) {
                for(auto it = props.begin(); it != props.end(); ++it) o[it.key()] = it.value();
                m_objects[i] = o;
                break;
            }
        }
        refresh();
    };
    auto undo = [this, id, oldProps]() {
        for(int i=0; i<m_objects.size(); ++i) {
            QJsonObject o = m_objects[i].toObject();
            if(o["id"].toString() == id) {
                for(auto it = oldProps.begin(); it != oldProps.end(); ++it) o[it.key()] = it.value();
                m_objects[i] = o; break;
            }
        }
        refresh();
    };
    m_undoStack->push(new BaseCommand(tr("Update Object"), redo, undo));
}

void Document::removeObject(const QString& id) {
    QJsonObject removed;
    int idx = -1;
    for(int i=0; i<m_objects.size(); ++i) {
        if(m_objects[i].toObject()["id"].toString() == id) {
            removed = m_objects[i].toObject();
            idx = i; break;
        }
    }
    if(idx == -1) return;

    auto redo = [this, id]() {
        for(int i=0; i<m_objects.size(); ++i) {
            if(m_objects[i].toObject()["id"].toString() == id) {
                m_objects.removeAt(i); break;
            }
        }
        refresh();
    };
    auto undo = [this, removed, idx]() { m_objects.insert(idx, removed); refresh(); };
    m_undoStack->push(new BaseCommand(tr("Remove Object"), redo, undo));
}

void Document::clear() {
    m_objects = QJsonArray();
    m_undoStack->clear();
    setDirty(false);
    emit objectsChanged();
}

void Document::save(const QString& path) {
    QString realPath = QUrl(path).toLocalFile();
    if(realPath.isEmpty()) realPath = path;
    QFile file(realPath);
    if (file.open(QIODevice::WriteOnly)) {
        QJsonObject root;
        root["objects"] = m_objects;
        file.write(QJsonDocument(root).toJson());
        setDirty(false);
    }
}

void Document::load(const QString& path) {
    QString realPath = QUrl(path).toLocalFile();
    if(realPath.isEmpty()) realPath = path;
    QFile file(realPath);
    if (file.open(QIODevice::ReadOnly)) {
        QJsonObject root = QJsonDocument::fromJson(file.readAll()).object();
        m_objects = root["objects"].toArray();
        m_undoStack->clear();
        setDirty(false);
        emit objectsChanged();
    }
}

void Document::setDirty(bool d) {
    if(m_dirty == d) return;
    m_dirty = d;
    emit dirtyChanged();
}

void Document::refresh() {
    setDirty(true);
    emit objectsChanged();
}

void Document::setGridVisible(bool v) {
    if(m_gridVisible == v) return;
    m_gridVisible = v;
    emit gridVisibleChanged();
}

void Document::setSnapEnabled(bool v) {
    if(m_snapEnabled == v) return;
    m_snapEnabled = v;
    emit snapEnabledChanged();
}
