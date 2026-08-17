#include <QObject>
#include <QString>
#include <QtQml/qqmlregistration.h>

#pragma once

class FileService : public QObject {
    Q_OBJECT
    QML_ELEMENT
public:
    explicit FileService(QObject *parent = nullptr);

    Q_INVOKABLE void saveFile(const QString& path, const QString& content);
    Q_INVOKABLE QString readFile(const QString& path);
};
