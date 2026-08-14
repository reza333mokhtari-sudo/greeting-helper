#include "Document.h"
#include <QFile>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

Document::Document(QObject *parent) : QObject(parent) {
}

void Document::addShape(const QJsonObject& shape) {
    m_shapes.append(shape);
    emit documentChanged();
}

void Document::addObject(const QJsonObject& obj) {
    m_objects.append(obj);
    emit documentChanged();
}

void Document::save(const QString& filePath) {
    QJsonObject root;
    root["shapes"] = m_shapes;
    root["objects"] = m_objects;
    
    QFile file(filePath);
    if (file.open(QIODevice::WriteOnly)) {
        file.write(QJsonDocument(root).toJson());
    }
}

void Document::load(const QString& filePath) {
    QFile file(filePath);
    if (file.open(QIODevice::ReadOnly)) {
        QJsonObject root = QJsonDocument::fromJson(file.readAll()).object();
        m_shapes = root["shapes"].toArray();
        m_objects = root["objects"].toArray();
        emit documentChanged();
    }
}
