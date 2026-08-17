#include <services/AiClient.h>
#include <QNetworkRequest>
#include <QJsonObject>
#include <QJsonDocument>

/**
 * AI Client Implementation
 */

AiClient::AiClient(QObject *parent) : QObject(parent) {
    m_network = new QNetworkAccessManager(this);
}

void AiClient::sendMessage(const QString& prompt) {
    if (m_isLoading) return;
    
    m_isLoading = true;
    emit isLoadingChanged();

    QNetworkRequest request(QUrl("https://id-preview--8fcae60c-9d66-40f7-8995-c04b7f611207.lovable.app/api/ai/chat"));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");
    request.setTransferTimeout(30000); // 30s timeout

    QJsonObject body;
    body["prompt"] = prompt;

    QNetworkReply* reply = m_network->post(request, QJsonDocument(body).toJson());
    
    connect(reply, &QNetworkReply::finished, this, [this, reply]() {
        m_isLoading = false;
        emit isLoadingChanged();
        
        if (reply->error() == QNetworkReply::NoError) {
            QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
            if (doc.isObject()) {
                QJsonObject res = doc.object();
                emit responseReceived(res["text"].toString());
            } else {
                emit errorOccurred(tr("Invalid AI response format"));
            }
        } else {
            emit errorOccurred(reply->errorString());
        }
        reply->deleteLater();
    });
}
