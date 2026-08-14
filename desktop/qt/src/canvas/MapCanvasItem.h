#pragma once
#include <QtQuick/QQuickPaintedItem>
#include <QPainter>
#include <QPointF>
#include <QVector>
#include "../core/Document.h"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

class MapCanvasItem : public QQuickPaintedItem {
    Q_OBJECT
    Q_PROPERTY(Document* document READ document WRITE setDocument NOTIFY documentChanged)
    Q_PROPERTY(QString currentTool READ currentTool WRITE setCurrentTool NOTIFY currentToolChanged)

public:
    explicit MapCanvasItem(QQuickItem *parent = nullptr);

    void paint(QPainter *painter) override;

    Document* document() const { return m_document; }
    void setDocument(Document* doc);

    QString currentTool() const { return m_currentTool; }
    void setCurrentTool(const QString& tool);

protected:
    void mousePressEvent(QMouseEvent *event) override;
    void mouseMoveEvent(QMouseEvent *event) override;
    void mouseReleaseEvent(QMouseEvent *event) override;
    void wheelEvent(QWheelEvent *event) override;

signals:
    void documentChanged();
    void currentToolChanged();

private:
    void drawGrid(QPainter *painter);
    void drawShapes(QPainter *painter);
    
    Document* m_document = nullptr;
    QString m_currentTool = "select";
    
    QPointF m_lastMousePos;
    QPointF m_panOffset = QPointF(0, 0);
    double m_zoom = 1.0;
    bool m_isDrawing = false;
    QPointF m_drawStart;
};
