#include "Document.h"
#include <QFile>
#include <QJsonDocument>
#include <QUndoCommand>
#include <QUuid>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

class AddObjectCommand : public QUndoCommand {
public:
    AddObjectCommand(QJsonArray& objects, const QJsonObject& obj, std::function<void()> refresh) 
        : m_objects(objects), m_obj(obj), m_refresh(refresh) {
        setText("Add Object");
    }
    void redo() override { 
        m_objects.append(m_obj); 
        m_refresh(); 
    }
    void undo() override { 
        for(int i=0; i<m_objects.size(); ++i) {
            if(m_objects[i].toObject()["id"].toString() == m_obj["id"].toString()) {
                m_objects.removeAt(i);
                break;
            }
        }
        m_refresh(); 
    }
private:
    QJsonArray& m_objects;
    QJsonObject m_obj;
    std::function<void()> m_refresh;
};

class RemoveObjectCommand : public QUndoCommand {
public:
    RemoveObjectCommand(QJsonArray& objects, const QString& id, std::function<void()> refresh) 
        : m_objects(objects), m_id(id), m_refresh(refresh) {
        setText("Remove Object");
    }
    void redo() override { 
        for(int i=0; i<m_objects.size(); ++i) {
            if(m_objects[i].toObject()["id"].toString() == m_id) {
                m_removedObj = m_objects[i].toObject();
                m_objects.removeAt(i);
                break;
            }
        }
        m_refresh(); 
    }
    void undo() override { 
        m_objects.append(m_removedObj);
        m_refresh(); 
    }
private:
    QJsonArray& m_objects;
    QString m_id;
    QJsonObject m_removedObj;
    std::function<void()> m_refresh;
};

class UpdateObjectCommand : public QUndoCommand {
public:
    UpdateObjectCommand(QJsonArray& objects, const QString& id, const QJsonObject& newProps, std::function<void()> refresh) 
        : m_objects(objects), m_id(id), m_newProps(newProps), m_refresh(refresh) {
        setText("Update Object");
    }
    void redo() override { 
        for(int i=0; i<m_objects.size(); ++i) {
            QJsonObject o = m_objects[i].toObject();
            if(o["id"].toString() == m_id) {
                m_oldProps = QJsonObject();
                for(auto it = m_newProps.begin(); it != m_newProps.end(); ++it) {
                    m_oldProps[it.key()] = o[it.key()];
                    o[it.key()] = it.value();
                }
                m_objects[i] = o;
                break;
            }
        }
        m_refresh(); 
    }
    void undo() override { 
        for(int i=0; i<m_objects.size(); ++i) {
            QJsonObject o = m_objects[i].toObject();
            if(o["id"].toString() == m_id) {
                for(auto it = m_oldProps.begin(); it != m_oldProps.end(); ++it) {
                    o[it.key()] = it.value();
                }
                m_objects[i] = o;
                break;
            }
        }
        m_refresh(); 
    }
private:
    QJsonArray& m_objects;
    QString m_id;
    QJsonObject m_newProps;
    QJsonObject m_oldProps;
    std::function<void()> m_refresh;
};

Document::Document(QObject *parent) : QObject(parent), m_dirty(false), m_gridVisible(true) {
    m_undoStack = new QUndoStack(this);
}

void Document::addObject(const QJsonObject& obj) {
    QJsonObject newObj = obj;
    if(!newObj.contains("id")) newObj["id"] = QUuid::createUuid().toString();
    if(!newObj.contains("name")) newObj["name"] = "New Object";
    if(!newObj.contains("x")) newObj["x"] = 0.0;
    if(!newObj.contains("y")) newObj["y"] = 0.0;
    if(!newObj.contains("rotation")) newObj["rotation"] = 0.0;
    if(!newObj.contains("cornerRadius")) newObj["cornerRadius"] = 0.0;
    
    m_undoStack->push(new AddObjectCommand(m_objects, newObj, [this](){ emit documentChanged(); setDirty(true); }));
}

void Document::updateObject(const QString& id, const QJsonObject& props) {
    m_undoStack->push(new UpdateObjectCommand(m_objects, id, props, [this](){ emit documentChanged(); setDirty(true); }));
}

void Document::removeObject(const QString& id) {
    m_undoStack->push(new RemoveObjectCommand(m_objects, id, [this](){ emit documentChanged(); setDirty(true); }));
}

void Document::clear() {
    m_objects = QJsonArray();
    m_undoStack->clear();
    setDirty(false);
    emit documentChanged();
}

void Document::save(const QString& filePath) {
    QJsonObject root;
    root["objects"] = m_objects;
    QFile file(filePath);
    if (file.open(QIODevice::WriteOnly)) {
        file.write(QJsonDocument(root).toJson());
        setDirty(false);
    }
}

void Document::load(const QString& filePath) {
    QFile file(filePath);
    if (file.open(QIODevice::ReadOnly)) {
        QJsonObject root = QJsonDocument::fromJson(file.readAll()).object();
        m_objects = root["objects"].toArray();
        m_undoStack->clear();
        setDirty(false);
        emit documentChanged();
    }
}

void Document::setDirty(bool dirty) {
    if(m_dirty == dirty) return;
    m_dirty = dirty;
    emit dirtyChanged();
}
