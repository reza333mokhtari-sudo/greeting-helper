#pragma once
#include <QObject>
#include <QJsonArray>
#include <QJsonObject>
#include <QUndoStack>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

class Document : public QObject {
    Q_OBJECT
    Q_PROPERTY(QJsonArray objects READ objects NOTIFY documentChanged)
    Q_PROPERTY(QUndoStack* undoStack READ undoStack CONSTANT)
    Q_PROPERTY(bool dirty READ dirty NOTIFY dirtyChanged)
    Q_PROPERTY(bool gridVisible READ gridVisible WRITE setGridVisible NOTIFY gridVisibleChanged)

public:
    explicit Document(QObject *parent = nullptr);

    QJsonArray objects() const { return m_objects; }
    QUndoStack* undoStack() const { return m_undoStack; }
    bool dirty() const { return m_dirty; }
    bool gridVisible() const { return m_gridVisible; }
    void setGridVisible(bool visible) { if(m_gridVisible != visible) { m_gridVisible = visible; emit gridVisibleChanged(); emit documentChanged(); } }

    Q_INVOKABLE void addObject(const QJsonObject& obj);
    Q_INVOKABLE void updateObject(const QString& id, const QJsonObject& props);
    Q_INVOKABLE void removeObject(const QString& id);
    Q_INVOKABLE void clear();
    Q_INVOKABLE void save(const QString& filePath);
    Q_INVOKABLE void load(const QString& filePath);

signals:
    void documentChanged();
    void dirtyChanged();
    void gridVisibleChanged();

private:
    void setDirty(bool dirty);

    QJsonArray m_objects;
    QUndoStack *m_undoStack;
    bool m_dirty;
    bool m_gridVisible;
};
