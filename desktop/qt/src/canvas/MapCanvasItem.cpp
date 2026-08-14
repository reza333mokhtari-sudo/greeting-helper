#include "MapCanvasItem.h"
#include <QPainter>
#include <QMouseEvent>
#include <QWheelEvent>
#include <cmath>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

MapCanvasItem::MapCanvasItem(QQuickItem *parent) : QQuickPaintedItem(parent) {
    setAcceptedMouseButtons(Qt::LeftButton | Qt::RightButton | Qt::MiddleButton);
    setAcceptHoverEvents(true);
}

void MapCanvasItem::paint(QPainter *painter) {
    if (!m_document) return;

    painter->setRenderHint(QPainter::Antialiasing);
    painter->translate(m_pan);
    painter->scale(m_zoom, m_zoom);

    // Grid
    if (m_document->gridVisible()) {
        painter->setPen(QPen(QColor(60, 60, 60), 0.5));
        int gridSize = 50;
        int limit = 2000;
        for (int i = -limit; i <= limit; i += gridSize) {
            painter->drawLine(i, -limit, i, limit);
            painter->drawLine(-limit, i, limit, i);
        }
    }

    // Objects
    QJsonArray objects = m_document->objects();
    for (const QJsonValue &v : objects) {
        QJsonObject obj = v.toObject();
        painter->save();
        painter->translate(obj["x"].toDouble(), obj["y"].toDouble());
        painter->rotate(obj["rotation"].toDouble());
        
        bool isSelected = obj["id"].toString() == m_selectedId;
        painter->setPen(isSelected ? QPen(Qt::cyan, 2) : QPen(Qt::black, 1));
        painter->setBrush(QColor(100, 100, 100, 200));
        
        double r = obj["cornerRadius"].toDouble();
        painter->drawRoundedRect(-25, -25, 50, 50, r, r);
        
        painter->restore();
    }
}

void MapCanvasItem::mousePressEvent(QMouseEvent *event) {
    m_lastMousePos = event->position().toPoint();
    if (event->button() == Qt::LeftButton) {
        QPointF scenePos = (event->position() - m_pan) / m_zoom;
        
        QString hitId = "";
        QJsonArray objects = m_document->objects();
        for (int i = objects.size() - 1; i >= 0; --i) {
            QJsonObject obj = objects[i].toObject();
            QRectF rect(obj["x"].toDouble() - 25, obj["y"].toDouble() - 25, 50, 50);
            if (rect.contains(scenePos)) {
                hitId = obj["id"].toString();
                break;
            }
        }
        
        if (hitId != m_selectedId) {
            m_selectedId = hitId;
            emit selectionChanged(m_selectedId);
            update();
        }
    }
}

void MapCanvasItem::mouseMoveEvent(QMouseEvent *event) {
    if (event->buttons() & Qt::RightButton || event->buttons() & Qt::MiddleButton) {
        m_pan += (event->position().toPoint() - m_lastMousePos);
        update();
    }
    m_lastMousePos = event->position().toPoint();
}

void MapCanvasItem::wheelEvent(QWheelEvent *event) {
    double oldZoom = m_zoom;
    double factor = event->angleDelta().y() > 0 ? 1.1 : 0.9;
    m_zoom *= factor;
    m_zoom = std::max(0.1, std::min(m_zoom, 10.0));
    
    // Zoom toward cursor
    QPointF mousePos = event->position();
    m_pan = mousePos - (mousePos - m_pan) * (m_zoom / oldZoom);
    
    update();
}

void MapCanvasItem::setDocument(Document *doc) {
    if (m_document == doc) return;
    m_document = doc;
    connect(m_document, &Document::documentChanged, this, [this](){ update(); });
    update();
}
