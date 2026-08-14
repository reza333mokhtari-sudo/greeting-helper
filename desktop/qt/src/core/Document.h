#pragma once
#include <QObject>
#include <QVector>
#include <QString>
#include <QJsonObject>
#include <QJsonArray>
#include <QJsonDocument>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

struct Point {
    double x, y;
};

struct Shape {
    QString id;
    QString kind; // rect, ellipse, poly, path
    QVector<Point> pts;
    bool erase = false;
};

struct MapObject {
    QString id;
    QString kind;
    QString layerId;
    double x, y;
    double rotation = 0;
    double scale = 1.0;
    double rx = 0, ry = 0;
};

class Document : public QObject {
    Q_OBJECT
    Q_PROPERTY(QJsonArray shapes READ shapes NOTIFY documentChanged)
    Q_PROPERTY(QJsonArray objects READ objects NOTIFY documentChanged)

public:
    explicit Document(QObject *parent = nullptr);

    QJsonArray shapes() const { return m_shapes; }
    QJsonArray objects() const { return m_objects; }

    Q_INVOKABLE void addShape(const QJsonObject& shape);
    Q_INVOKABLE void addObject(const QJsonObject& obj);
    Q_INVOKABLE void save(const QString& filePath);
    Q_INVOKABLE void load(const QString& filePath);

signals:
    void documentChanged();

private:
    QJsonArray m_shapes;
    QJsonArray m_objects;
};
