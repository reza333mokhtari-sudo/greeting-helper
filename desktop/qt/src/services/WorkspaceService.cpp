#include "WorkspaceService.h"
#include <QDateTime>
#include <QStandardPaths>
#include <QDir>
#include <QFile>
#include <QJsonDocument>
#include <QJsonObject>

WorkspaceService::WorkspaceService(QObject *parent) : QObject(parent) {
    QString path = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/workspaces";
    QDir().mkpath(path);
}

void WorkspaceService::saveLayout(const QString& name, const QVariantMap& layout) {
    QString path = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/workspaces/" + name + ".json";
    QFile file(path);
    if (file.open(QIODevice::WriteOnly)) {
        QJsonObject obj = QJsonObject::fromVariantMap(layout);
        file.write(QJsonDocument(obj).toJson());
    }
}

QVariantMap WorkspaceService::loadLayout(const QString& name) {
    QString path = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/workspaces/" + name + ".json";
    QFile file(path);
    if (file.open(QIODevice::ReadOnly)) {
        QJsonObject obj = QJsonDocument::fromJson(file.readAll()).object();
        return obj.toVariantMap();
    }
    return QVariantMap();
}

QStringList WorkspaceService::listLayouts() const {
    QString path = QStandardPaths::writableLocation(QStandardPaths::AppDataLocation) + "/workspaces";
    return QDir(path).entryList(QStringList() << "*.json", QDir::Files);
}

void WorkspaceService::logMessage(const QString& msg, const QString& level) {
    QString timestamp = QDateTime::currentDateTime().toString("hh:mm:ss.zzz");
    QString entry = QString("[%1] [%2] %3").arg(timestamp).arg(level.toUpper()).arg(msg);
    m_logs.prepend(entry);
    if (m_logs.size() > 200) m_logs.removeLast();
    emit logsChanged();
    emit newLogEntry(msg, level, timestamp);
}
