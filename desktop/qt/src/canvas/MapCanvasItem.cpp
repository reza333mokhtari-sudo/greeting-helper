#include "MapCanvasItem.h"
#include <QPainter>
#include <QMouseEvent>
#include <QWheelEvent>
#include <QUuid>
#include <cmath>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

MapCanvasItem::MapCanvasItem(QQuickItem *parent) : QQuickPaintedItem(parent) {
    setAcceptedMouseButtons(Qt::LeftButton | Qt::RightButton | Qt::MiddleButton);
    setAcceptHoverEvents(true);
}

QPointF MapCanvasItem::screenToWorld(const QPointF& screenPos) const {
    return (screenPos - m_pan) / m_zoom;
}

void MapCanvasItem::paint(QPainter *painter) {
    if (!m_document) return;

    painter->setRenderHint(QPainter::Antialiasing);
    painter->translate(m_pan);
    painter->scale(m_zoom, m_zoom);

    // Advanced Grid
    painter->setPen(QPen(QColor(45, 45, 45), 1.0 / m_zoom));
    int gridSize = 50;
    int limit = 5000;
    for (int i = -limit; i <= limit; i += gridSize) {
        painter->drawLine(i, -limit, i, limit);
        painter->drawLine(-limit, i, limit, i);
    }
    
    // Major Grid Lines
    painter->setPen(QPen(QColor(60, 60, 60), 1.5 / m_zoom));
    for (int i = -limit; i <= limit; i += gridSize * 5) {
        painter->drawLine(i, -limit, i, limit);
        painter->drawLine(-limit, i, limit, i);
    }

    // Objects
    QJsonArray objects = m_document->objects();
    for (const QJsonValue &v : objects) {
        QJsonObject obj = v.toObject();
        painter->save();
        
        bool isSelected = obj["id"].toString() == m_selectedId;
        
        if (obj["kind"].toString() == "rect") {
            painter->setBrush(QColor(80, 80, 90, 150));
            painter->setPen(isSelected ? QPen(Qt::cyan, 3 / m_zoom) : QPen(QColor(200, 200, 200), 1 / m_zoom));
            painter->drawRect(obj["x"].toDouble(), obj["y"].toDouble(), obj["w"].toDouble(), obj["h"].toDouble());
        } else {
            painter->translate(obj["x"].toDouble(), obj["y"].toDouble());
            painter->rotate(obj["rotation"].toDouble());
            painter->setBrush(QColor(120, 120, 130, 200));
            painter->setPen(isSelected ? QPen(Qt::cyan, 3 / m_zoom) : QPen(Qt::black, 1 / m_zoom));
            double r = obj["cornerRadius"].toDouble();
            painter->drawRoundedRect(-25, -25, 50, 50, r, r);
        }
        
        painter->restore();
    }

    // Drawing Preview
    if (m_isDrawing && m_activeTool == "draw") {
        painter->setPen(QPen(Qt::cyan, 2 / m_zoom, Qt::DashLine));
        painter->setBrush(QColor(0, 255, 255, 30));
        QRectF preview(m_drawStart.x(), m_drawStart.y(), 
                       m_currentWorldPos.x() - m_drawStart.x(), 
                       m_currentWorldPos.y() - m_drawStart.y());
        painter->drawRect(preview.normalized());
    }
}

void MapCanvasItem::mousePressEvent(QMouseEvent *event) {
    m_lastMousePos = event->position().toPoint();
    QPointF worldPos = screenToWorld(event->position());

    if (event->button() == Qt::LeftButton) {
        if (m_activeTool == "select") {
            handleSelection(worldPos);
        } else if (m_activeTool == "draw") {
            m_isDrawing = true;
            m_drawStart = worldPos;
            m_currentWorldPos = worldPos;
        }
    }
    update();
}

void MapCanvasItem::mouseMoveEvent(QMouseEvent *event) {
    QPointF worldPos = screenToWorld(event->position());
    m_currentWorldPos = worldPos;

    if (event->buttons() & Qt::LeftButton) {
        if (m_activeTool == "move" && !m_selectedId.isEmpty()) {
            QPointF delta = (event->position() - m_lastMousePos) / m_zoom;
            QJsonArray objects = m_document->objects();
            for (const QJsonValue &v : objects) {
                QJsonObject obj = v.toObject();
                if (obj["id"].toString() == m_selectedId) {
                    obj["x"] = obj["x"].toDouble() + delta.x();
                    obj["y"] = obj["y"].toDouble() + delta.y();
                    m_document->updateObject(m_selectedId, obj);
                    break;
                }
            }
        }
    } else if (event->buttons() & (Qt::RightButton | Qt::MiddleButton)) {
        m_pan += (event->position().toPoint() - m_lastMousePos);
    }
    
    m_lastMousePos = event->position().toPoint();
    update();
}

void MapCanvasItem::mouseReleaseEvent(QMouseEvent *event) {
    if (event->button() == Qt::LeftButton && m_isDrawing && m_activeTool == "draw") {
        m_isDrawing = false;
        QRectF rect = QRectF(m_drawStart, m_currentWorldPos).normalized();
        if (rect.width() > 5 && rect.height() > 5) {
            QJsonObject newRoom;
            newRoom["kind"] = "rect";
            newRoom["name"] = "Room";
            newRoom["x"] = rect.x();
            newRoom["y"] = rect.y();
            newRoom["w"] = rect.width();
            newRoom["h"] = rect.height();
            m_document->addObject(newRoom);
        }
    }
    update();
}

void MapCanvasItem::handleSelection(const QPointF& worldPos) {
    QString hitId = "";
    QJsonArray objects = m_document->objects();
    for (int i = objects.size() - 1; i >= 0; --i) {
        QJsonObject obj = objects[i].toObject();
        QRectF rect;
        if (obj["kind"].toString() == "rect") {
            rect = QRectF(obj["x"].toDouble(), obj["y"].toDouble(), obj["w"].toDouble(), obj["h"].toDouble());
        } else {
            rect = QRectF(obj["x"].toDouble() - 25, obj["y"].toDouble() - 25, 50, 50);
        }
        
        if (rect.contains(worldPos)) {
            hitId = obj["id"].toString();
            break;
        }
    }
    
    if (hitId != m_selectedId) {
        m_selectedId = hitId;
        emit selectionChanged(m_selectedId);
    }
}

void MapCanvasItem::wheelEvent(QWheelEvent *event) {
    double oldZoom = m_zoom;
    double factor = event->angleDelta().y() > 0 ? 1.1 : 0.9;
    m_zoom *= factor;
    m_zoom = std::max(0.05, std::min(m_zoom, 20.0));
    
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
