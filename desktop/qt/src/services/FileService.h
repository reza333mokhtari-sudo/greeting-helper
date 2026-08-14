#pragma once
#include <QObject>
#include <QString>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

class FileService : public QObject {
    Q_OBJECT

public:
    explicit FileService(QObject *parent = nullptr);

    Q_INVOKABLE void saveToFile(const QString& path, const QString& content);
    Q_INVOKABLE QString loadFromFile(const QString& path);
};
