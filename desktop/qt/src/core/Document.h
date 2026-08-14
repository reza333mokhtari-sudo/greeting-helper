#pragma once
#include <QObject>
#include <QJsonArray>
#include <QJsonObject>
#include <QUndoStack>

class Document : public QObject {
    Q_OBJECT
    Q_PROPERTY(QJsonArray objects READ objects NOTIFY objectsChanged)
    Q_PROPERTY(QUndoStack* undoStack READ undoStack CONSTANT)
    Q_PROPERTY(bool dirty READ dirty NOTIFY dirtyChanged)
    Q_PROPERTY(bool gridVisible READ gridVisible WRITE setGridVisible NOTIFY gridVisibleChanged)
    Q_PROPERTY(bool snapEnabled READ snapEnabled WRITE setSnapEnabled NOTIFY snapEnabledChanged)

public:
    explicit Document(QObject *parent = nullptr);

    QJsonArray objects() const { return m_objects; }
    QUndoStack* undoStack() const { return m_undoStack; }
    bool dirty() const { return m_dirty; }
    bool gridVisible() const { return m_gridVisible; }
    void setGridVisible(bool v);
    bool snapEnabled() const { return m_snapEnabled; }
    void setSnapEnabled(bool v);

    Q_INVOKABLE void addObject(QJsonObject obj);
    Q_INVOKABLE void updateObject(const QString& id, QJsonObject props);
    Q_INVOKABLE void removeObject(const QString& id);
    Q_INVOKABLE void clear();
    
    Q_INVOKABLE void save(const QString& url);
    Q_INVOKABLE void load(const QString& url);

signals:
    void objectsChanged();
    void dirtyChanged();
    void gridVisibleChanged();
    void snapEnabledChanged();

private:
    void setDirty(bool d);
    void refresh();

    QJsonArray m_objects;
    QUndoStack *m_undoStack;
    bool m_dirty = false;
    bool m_gridVisible = true;
    bool m_snapEnabled = true;
};
