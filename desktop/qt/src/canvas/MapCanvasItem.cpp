#include "MapCanvasItem.h"
#include <QMouseEvent>
#include <QWheel>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

MapCanvasItem::MapCanvasItem(QQuickItem *parent) : QQuickPaintedItem(parent) {
    setAcceptedMouseButtons(Qt::LeftButton | Qt::RightButton | Qt::MiddleButton);
    setAcceptHoverEvents(true);
}

void MapCanvasItem::setDocument(Document* doc) {
    if (m_document == doc) return;
    m_document = doc;
    connect(m_document, &Document::documentChanged, this, [this](){ update(); });
    emit documentChanged();
    update();
}

void MapCanvasItem::setCurrentTool(const QString& tool) {
    if (m_currentTool == tool) return;
    m_currentTool = tool;
    emit currentToolChanged();
}

void MapCanvasItem::paint(QPainter *painter) {
    painter->save();
    painter->translate(m_panOffset);
    painter->scale(m_zoom, m_zoom);

    drawGrid(painter);
    drawShapes(painter);

    painter->restore();
}

void MapCanvasItem::drawGrid(QPainter *painter) {
    painter->setPen(QPen(QColor(200, 200, 200, 50), 1));
    int step = 32;
    QRectF r = boundingRect();
    
    for (int x = -2000; x < 2000; x += step) {
        painter->drawLine(x, -2000, x, 2000);
    }
    for (int y = -2000; y < 2000; y += step) {
        painter->drawLine(-2000, y, 2000, y);
    }
}

void MapCanvasItem::drawShapes(QPainter *painter) {
    if (!m_document) return;
    
    painter->setBrush(QColor(244, 239, 227));
    painter->setPen(QPen(Qt::black, 2));

    QJsonArray shapes = m_document->shapes();
    for (int i = 0; i < shapes.size(); ++i) {
        QJsonObject s = shapes[i].toObject();
        if (s["kind"].toString() == "rect") {
            double x = s["x"].toDouble();
            double y = s["y"].toDouble();
            double w = s["w"].toDouble();
            double h = s["h"].toDouble();
            painter->drawRect(QRectF(x, y, w, h));
        }
    }
}

void MapCanvasItem::mousePressEvent(QMouseEvent *event) {
    m_lastMousePos = event->position();
    
    if (m_currentTool == "draw") {
        m_isDrawing = true;
        m_drawStart = (event->position() - m_panOffset) / m_zoom;
    }
}

void MapCanvasItem::mouseMoveEvent(QMouseEvent *event) {
    if (event->buttons() & Qt::MiddleButton || (event->buttons() & Qt::LeftButton && m_currentTool == "pan")) {
        m_panOffset += event->position() - m_lastMousePos;
        update();
    }
    m_lastMousePos = event->position();
}

void MapCanvasItem::mouseReleaseEvent(QMouseEvent *event) {
    if (m_isDrawing && m_document) {
        QPointF end = (event->position() - m_panOffset) / m_zoom;
        QJsonObject rect;
        rect["kind"] = "rect";
        rect["x"] = qMin(m_drawStart.x(), end.x());
        rect["y"] = qMin(m_drawStart.y(), end.y());
        rect["w"] = qAbs(m_drawStart.x() - end.x());
        rect["h"] = qAbs(m_drawStart.y() - end.y());
        m_document->addShape(rect);
        m_isDrawing = false;
        update();
    }
}

void MapCanvasItem::wheelEvent(QWheelEvent *event) {
    double factor = 1.1;
    if (event->angleDelta().y() < 0) factor = 1.0 / factor;
    m_zoom *= factor;
    update();
}
