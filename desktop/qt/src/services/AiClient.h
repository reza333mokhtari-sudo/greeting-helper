#include <QObject>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QString>
#include <QtQml/qqmlregistration.h>

#pragma once

class AiClient : public QObject {
    Q_OBJECT
    QML_ELEMENT
    Q_PROPERTY(bool isLoading READ isLoading NOTIFY isLoadingChanged)

public:
    explicit AiClient(QObject *parent = nullptr);

    bool isLoading() const { return m_isLoading; }
    
    Q_INVOKABLE void sendMessage(const QString& prompt);

signals:
    void isLoadingChanged();
    void responseReceived(const QString& response);
    void errorOccurred(const QString& error);

private:
    QNetworkAccessManager* m_network;
    bool m_isLoading = false;
};
