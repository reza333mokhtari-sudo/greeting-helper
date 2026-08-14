#include "MapCanvasItem.h"
#include <QPainter>
#include <QMouseEvent>
#include <QWheelEvent>
#include <cmath>

MapCanvasItem::MapCanvasItem(QQuickItem *parent) : QQuickPaintedItem(parent) {
    setAcceptedMouseButtons(Qt::LeftButton | Qt::RightButton | Qt::MiddleButton);
    setAcceptHoverEvents(true);
    setFocus(true);
}

QPointF MapCanvasItem::screenToWorld(const QPointF& screenPos) const {
    return (screenPos - m_pan) / m_zoom;
}

double MapCanvasItem::snap(double val) const {
    if (!m_document || !m_document->snapEnabled()) return val;
    return std::round(val / 50.0) * 50.0;
}

void MapCanvasItem::paint(QPainter *painter) {
    if (!m_document) return;

    painter->setRenderHint(QPainter::Antialiasing);
    painter->translate(m_pan);
    painter->scale(m_zoom, m_zoom);

    // Grid
    if (m_document->gridVisible()) {
        painter->setPen(QPen(QColor(45, 45, 45), 1.0 / m_zoom));
        int gridSize = 50;
        int limit = 5000;
        for (int i = -limit; i <= limit; i += gridSize) {
            painter->drawLine(i, -limit, i, limit);
            painter->drawLine(-limit, i, limit, i);
        }
        painter->setPen(QPen(QColor(60, 60, 60), 1.5 / m_zoom));
        for (int i = -limit; i <= limit; i += gridSize * 5) {
            painter->drawLine(i, -limit, i, limit);
            painter->drawLine(-limit, i, limit, i);
        }
    }

    // Objects
    QJsonArray objects = m_document->objects();
    for (const QJsonValue &v : objects) {
        QJsonObject obj = v.toObject();
        painter->save();
        
        bool isSelected = obj["id"].toString() == m_selectedId;
        
        if (obj["kind"].toString() == "rect") {
            painter->setBrush(QColor(70, 70, 80, 180));
            painter->setPen(isSelected ? QPen(Qt::cyan, 3 / m_zoom) : QPen(QColor(180, 180, 190), 1 / m_zoom));
            painter->drawRect(obj["x"].toDouble(), obj["y"].toDouble(), obj["w"].toDouble(), obj["h"].toDouble());
        } else {
            painter->translate(obj["x"].toDouble(), obj["y"].toDouble());
            painter->rotate(obj["rotation"].toDouble());
            painter->setBrush(QColor(100, 100, 110, 200));
            painter->setPen(isSelected ? QPen(Qt::cyan, 3 / m_zoom) : QPen(Qt::black, 1 / m_zoom));
            double r = obj["cornerRadius"].toDouble();
            painter->drawRoundedRect(-25, -25, 50, 50, r, r);
        }
        
        painter->restore();
    }

    // Drawing Preview
    if (m_isDrawing && m_activeTool == "draw") {
        painter->setPen(QPen(Qt::cyan, 2 / m_zoom, Qt::DashLine));
        painter->setBrush(QColor(0, 255, 255, 20));
        double x1 = snap(m_drawStart.x());
        double y1 = snap(m_drawStart.y());
        double x2 = snap(m_currentWorldPos.x());
        double y2 = snap(m_currentWorldPos.y());
        painter->drawRect(QRectF(QPointF(x1, y1), QPointF(x2, y2)).normalized());
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
        } else if (m_activeTool == "pan") {
            m_isPanning = true;
        }
    } else if (event->button() == Qt::MiddleButton || event->button() == Qt::RightButton) {
        m_isPanning = true;
    }
    update();
}

void MapCanvasItem::mouseMoveEvent(QMouseEvent *event) {
    QPointF worldPos = screenToWorld(event->position());
    m_currentWorldPos = worldPos;
    emit cursorWorldChanged(worldPos);

    if (m_isPanning) {
        m_pan += (event->position().toPoint() - m_lastMousePos);
        emit panChanged();
    } else if (event->buttons() & Qt::LeftButton) {
        if (m_activeTool == "select" && !m_selectedId.isEmpty()) {
            // Drag move
            QPointF delta = (event->position() - m_lastMousePos) / m_zoom;
            QJsonObject obj;
            int idx = -1;
            for (int i = 0; i < m_document->objects().size(); ++i) {
                if (m_document->objects()[i].toObject()["id"].toString() == m_selectedId) {
                    obj = m_document->objects()[i].toObject();
                    idx = i;
                    break;
                }
            }
            if (idx != -1) {
                obj["x"] = obj["x"].toDouble() + delta.x();
                obj["y"] = obj["y"].toDouble() + delta.y();
                m_document->updateObject(m_selectedId, obj);
            }
        }
    }
    
    m_lastMousePos = event->position().toPoint();
    update();
}

void MapCanvasItem::mouseReleaseEvent(QMouseEvent *event) {
    if (event->button() == Qt::LeftButton && m_isDrawing) {
        m_isDrawing = false;
        double x1 = snap(m_drawStart.x());
        double y1 = snap(m_drawStart.y());
        double x2 = snap(m_currentWorldPos.x());
        double y2 = snap(m_currentWorldPos.y());
        QRectF rect = QRectF(QPointF(x1, y1), QPointF(x2, y2)).normalized();
        if (rect.width() >= 10 && rect.height() >= 10) {
            QJsonObject obj;
            obj["kind"] = "rect";
            obj["name"] = "Room";
            obj["x"] = rect.x();
            obj["y"] = rect.y();
            obj["w"] = rect.width();
            obj["h"] = rect.height();
            m_document->addObject(obj);
        }
    }
    m_isPanning = false;
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
    double factor = event->angleDelta().y() > 0 ? 1.1 : 0.9;
    double oldZoom = m_zoom;
    m_zoom *= factor;
    m_zoom = std::max(0.01, std::min(m_zoom, 50.0));
    
    QPointF mousePos = event->position();
    m_pan = mousePos - (mousePos - m_pan) * (m_zoom / oldZoom);
    
    emit zoomChanged();
    emit panChanged();
    update();
}

void MapCanvasItem::keyPressEvent(QKeyEvent *event) {
    if (event->key() == Qt::Key_Delete || event->key() == Qt::Key_Backspace) {
        if (!m_selectedId.isEmpty()) m_document->removeObject(m_selectedId);
    }
}

void MapCanvasItem::setActiveTool(const QString& tool) {
    if (m_activeTool == tool) return;
    m_activeTool = tool;
    emit activeToolChanged();
}

void MapCanvasItem::setDocument(Document *doc) {
    if (m_document == doc) return;
    m_document = doc;
    connect(m_document, &Document::objectsChanged, this, [this](){ update(); });
    emit documentChanged();
}
