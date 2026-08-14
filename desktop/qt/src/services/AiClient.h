#pragma once
#include <QObject>
#include <QNetworkAccessManager>
#include <QNetworkReply>
#include <QString>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

class AiClient : public QObject {
    Q_OBJECT
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
