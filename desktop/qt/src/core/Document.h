#pragma once
#include <QObject>
#include <QVector>
#include <QString>
#include <QJsonObject>
#include <QJsonArray>
#include <QUndoStack>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

class Document : public QObject {
    Q_OBJECT
    Q_PROPERTY(QJsonArray objects READ objects NOTIFY documentChanged)
    Q_PROPERTY(bool isDirty READ isDirty NOTIFY dirtyChanged)

public:
    explicit Document(QObject *parent = nullptr);

    QJsonArray objects() const { return m_objects; }
    bool isDirty() const { return m_dirty; }

    Q_INVOKABLE void addObject(const QJsonObject& obj);
    Q_INVOKABLE void updateObject(const QString& id, const QJsonObject& props);
    Q_INVOKABLE void removeObject(const QString& id);
    Q_INVOKABLE void clear();
    
    Q_INVOKABLE void save(const QString& filePath);
    Q_INVOKABLE void load(const QString& filePath);

    Q_INVOKABLE void undo() { m_undoStack->undo(); }
    Q_INVOKABLE void redo() { m_undoStack->redo(); }

    Q_INVOKABLE void setGridVisible(bool visible) { m_gridVisible = visible; emit documentChanged(); }
    bool isGridVisible() const { return m_gridVisible; }

signals:
    void documentChanged();
    void dirtyChanged();

private:
    void setDirty(bool dirty);

    QJsonArray m_objects;
    bool m_dirty = false;
    bool m_gridVisible = true;
    QUndoStack* m_undoStack;
};
