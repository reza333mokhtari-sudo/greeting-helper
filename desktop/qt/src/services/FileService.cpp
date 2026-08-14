#include "FileService.h"
#include <QFile>
#include <QTextStream>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

FileService::FileService(QObject *parent) : QObject(parent) {}

void FileService::saveToFile(const QString& path, const QString& content) {
    QFile file(path);
    if (file.open(QIODevice::WriteOnly | QIODevice::Text)) {
        QTextStream out(&file);
        out << content;
        file.close();
    }
}

QString FileService::loadFromFile(const QString& path) {
    QFile file(path);
    if (file.open(QIODevice::ReadOnly | QIODevice::Text)) {
        QTextStream in(&file);
        QString content = in.readAll();
        file.close();
        return content;
    }
    return QString();
}
