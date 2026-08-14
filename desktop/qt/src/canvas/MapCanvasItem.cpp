#include "MapCanvasItem.h"
#include <QMouseEvent>
#include <QWheelEvent>
#include <QJsonObject>

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
    painter->setRenderHint(QPainter::Antialiasing);
    painter->save();
    painter->translate(m_panOffset);
    painter->scale(m_zoom, m_zoom);

    if (m_document && m_document->isGridVisible()) drawGrid(painter);
    drawShapes(painter);

    painter->restore();
}

void MapCanvasItem::drawGrid(QPainter *painter) {
    painter->setPen(QPen(QColor(200, 200, 200, 30), 1));
    int step = 32;
    int size = 5000;
    for (int x = -size; x <= size; x += step) painter->drawLine(x, -size, x, size);
    for (int y = -size; y <= size; y += step) painter->drawLine(-size, y, size, y);
}

void MapCanvasItem::drawShapes(QPainter *painter) {
    if (!m_document) return;
    
    QJsonArray objects = m_document->objects();
    for (int i = 0; i < objects.size(); ++i) {
        QJsonObject o = objects[i].toObject();
        painter->save();
        painter->translate(o["x"].toDouble(), o["y"].toDouble());
        painter->rotate(o["rotation"].toDouble());
        
        double w = 64, h = 64;
        double r = o["cornerRadius"].toDouble();

        painter->setBrush(QColor(244, 239, 227));
        painter->setPen(QPen(Qt::black, 2));
        painter->drawRoundedRect(QRectF(-w/2, -h/2, w, h), r, r);
        
        painter->setPen(Qt::black);
        painter->drawText(QRectF(-w/2, -h/2, w, h), Qt::AlignCenter, o["name"].toString());
        
        painter->restore();
    }
}

void MapCanvasItem::mousePressEvent(QMouseEvent *event) {
    m_lastMousePos = event->position();
    QPointF worldPos = (event->position() - m_panOffset) / m_zoom;

    if (m_currentTool == "select") {
        // Simple hit test
        QJsonArray objects = m_document->objects();
        bool found = false;
        for (int i = objects.size() - 1; i >= 0; --i) {
            QJsonObject o = objects[i].toObject();
            double ox = o["x"].toDouble();
            double oy = o["y"].toDouble();
            if (qAbs(worldPos.x() - ox) < 32 && qAbs(worldPos.y() - oy) < 32) {
                emit selectionChanged(o);
                found = true;
                break;
            }
        }
        if (!found) emit selectionChanged(QVariant());
    } else if (m_currentTool == "draw") {
        m_isDrawing = true;
        m_drawStart = worldPos;
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
        QJsonObject obj;
        obj["kind"] = "rect";
        obj["x"] = (m_drawStart.x() + end.x()) / 2;
        obj["y"] = (m_drawStart.y() + end.y()) / 2;
        obj["name"] = "Room";
        m_document->addObject(obj);
        m_isDrawing = false;
        update();
    }
}

void MapCanvasItem::wheelEvent(QWheelEvent *event) {
    double oldZoom = m_zoom;
    double factor = 1.1;
    if (event->angleDelta().y() < 0) factor = 1.0 / factor;
    m_zoom *= factor;
    
    // Zoom anchored to mouse
    QPointF mousePos = event->position();
    m_panOffset = mousePos - (mousePos - m_panOffset) * (m_zoom / oldZoom);
    
    emit zoomChanged();
    update();
}
