#ifndef WORKSPACESERVICE_H
#define WORKSPACESERVICE_H

#include <QObject>
#include <QStringList>
#include <QVariantMap>
#include <QtQml/qqmlregistration.h>

class WorkspaceService : public QObject {
    Q_OBJECT
    QML_ELEMENT
    Q_PROPERTY(QString activeTool READ activeTool WRITE setActiveTool NOTIFY activeToolChanged)

public:
    explicit WorkspaceService(QObject *parent = nullptr);

    Q_INVOKABLE void saveLayout(const QString& name, const QVariantMap& layout);
    Q_INVOKABLE QVariantMap loadLayout(const QString& name);
    Q_INVOKABLE QStringList listLayouts() const;

    // Diagnostic logging
    Q_INVOKABLE void logMessage(const QString& msg, const QString& level = "info");
    Q_PROPERTY(QStringList logs READ logs NOTIFY logsChanged)
    QStringList logs() const { return m_logs; }

signals:
    void logsChanged();
    void newLogEntry(const QString& msg, const QString& level, const QString& timestamp);
    void taskFailed(const QString& command, const QString& error, const QString& suggestion);


private:
    QStringList m_logs;
};

#endif // WORKSPACESERVICE_H
