#include <QQuickPaintedItem>
#include <QPointF>
#include <QJsonObject>
#include <QPainterPath>
#include <QCursor>
#include <QQuickItem>
#include <QtQml/qqmlregistration.h>

#include <core/Document.h>

#pragma once

class MapCanvasItem : public QQuickPaintedItem {
    Q_OBJECT
    QML_ELEMENT
    Q_PROPERTY(Document* document READ document WRITE setDocument NOTIFY documentChanged)
    Q_PROPERTY(QString activeTool READ activeTool WRITE setActiveTool NOTIFY activeToolChanged)
    Q_PROPERTY(double zoom READ zoom NOTIFY zoomChanged)
    Q_PROPERTY(QPointF pan READ pan NOTIFY panChanged)
    Q_PROPERTY(QPointF cursorWorldPos READ cursorWorldPos NOTIFY cursorWorldChanged)


public:
    explicit MapCanvasItem(QQuickItem *parent = nullptr);

    void paint(QPainter *painter) override;

    Document* document() const { return m_document; }
    void setDocument(Document *doc);

    QString activeTool() const { return m_activeTool; }
    void setActiveTool(const QString& tool);

    
    double zoom() const { return m_zoom; }
    QPointF pan() const { return m_pan; }
    QPointF cursorWorldPos() const { return m_currentWorldPos; }

signals:
    void documentChanged();
    void activeToolChanged();
    
    void zoomChanged();
    void panChanged();
    void cursorWorldChanged(const QPointF& pos);

protected:
    void mousePressEvent(QMouseEvent *event) override;
    void mouseMoveEvent(QMouseEvent *event) override;
    void mouseReleaseEvent(QMouseEvent *event) override;
    void wheelEvent(QWheelEvent *event) override;
    void keyPressEvent(QKeyEvent *event) override;

private:
    QPointF screenToWorld(const QPointF& screenPos) const;
    void handleSelection(const QPointF& worldPos);
    void handleDrawing(const QPointF& worldPos, bool finished);
    double snap(double val) const;

    Document *m_document = nullptr;
    QString m_activeTool = "select";

    
    double m_zoom = 1.0;
    QPointF m_pan = QPointF(0,0);
    QPoint m_lastMousePos;

    bool m_isDrawing = false;
    bool m_isPanning = false;
    QPointF m_drawStart;
    QPointF m_currentWorldPos;
};
