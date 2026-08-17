#ifndef WORKSPACESERVICE_H
#define WORKSPACESERVICE_H

#include <QObject>
#include <QString>
#include <QVariantMap>
#include <QtQml/qqmlregistration.h>


class WorkspaceService : public QObject {
    Q_OBJECT
    QML_ELEMENT
public:
    explicit WorkspaceService(QObject *parent = nullptr);

    Q_INVOKABLE void saveLayout(const QString& name, const QVariantMap& layout);
    Q_INVOKABLE QVariantMap loadLayout(const QString& name);
    Q_INVOKABLE QStringList listLayouts() const;
#endif // WORKSPACESERVICE_H
