#pragma once
#include <QQuickPaintedItem>
#include <QPointF>
#include "Document.h"

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

class MapCanvasItem : public QQuickPaintedItem {
    Q_OBJECT
    Q_PROPERTY(Document* document READ document WRITE setDocument NOTIFY documentChanged)
    Q_PROPERTY(double zoom READ zoom WRITE setZoom NOTIFY zoomChanged)
    Q_PROPERTY(QPointF pan READ pan WRITE setPan NOTIFY panChanged)

public:
    explicit MapCanvasItem(QQuickItem *parent = nullptr);

    void paint(QPainter *painter) override;

    Document* document() const { return m_document; }
    void setDocument(Document *doc);

    double zoom() const { return m_zoom; }
    void setZoom(double z) { if(m_zoom != z) { m_zoom = z; emit zoomChanged(); update(); } }

    QPointF pan() const { return m_pan; }
    void setPan(QPointF p) { if(m_pan != p) { m_pan = p; emit panChanged(); update(); } }

signals:
    void documentChanged();
    void zoomChanged();
    void panChanged();
    void selectionChanged(const QString& id);

protected:
    void mousePressEvent(QMouseEvent *event) override;
    void mouseMoveEvent(QMouseEvent *event) override;
    void wheelEvent(QWheelEvent *event) override;

private:
    Document *m_document = nullptr;
    double m_zoom = 1.0;
    QPointF m_pan = QPointF(0,0);
    QPoint m_lastMousePos;
    QString m_selectedId;
};
