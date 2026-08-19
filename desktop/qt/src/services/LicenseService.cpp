#include "LicenseService.h"
#include <QSettings>
#include <QCryptographicHash>
#include <QSysInfo>
#include <QDebug>
#include <QNetworkAccessManager>
#include <QNetworkRequest>
#include <QNetworkReply>
#include <QJsonDocument>
#include <QJsonObject>

LicenseService::LicenseService(QObject *parent) : QObject(parent) {
    m_hwid = generateHardwareId();
    loadLicense();
}

QString LicenseService::licenseType() const {
    return m_type;
}

bool LicenseService::isActive() const {
    return m_active;
}

QDateTime LicenseService::expiryDate() const {
    return m_expiry;
}

QString LicenseService::hardwareId() const {
    return m_hwid;
}

int LicenseService::monthsDuration() const {
    return m_months;
}

QDateTime LicenseService::lastSyncTime() const {
    return m_lastSync;
}

bool LicenseService::isSyncing() const {
    return m_isSyncing;
}

void LicenseService::activate(const QString& key) {
    if (m_isSyncing) return;
    
    m_isSyncing = true;
    emit isSyncingChanged();

    QNetworkAccessManager* manager = new QNetworkAccessManager(this);
    // The endpoint path corresponds to the validateLicense server function
    QNetworkRequest request(QUrl("https://project--8fcae60c-9d66-40f7-8995-c04b7f611207.lovable.app/_serverFn/eyJmaWxlIjoic3JjL2xpYi9hZG1pbi5mdW5jdGlvbnMudHMiLCJleHBvcnQiOiJ2YWxpZGF0ZUxpY2Vuc2UifQ=="));
    request.setHeader(QNetworkRequest::ContentTypeHeader, "application/json");

    QJsonObject data;
    data["key"] = key;
    data["hardwareId"] = m_hwid;

    QNetworkReply* reply = manager->post(request, QJsonDocument(data).toJson());

    connect(reply, &QNetworkReply::finished, [this, reply, manager, key]() {
        m_isSyncing = false;
        emit isSyncingChanged();

        if (reply->error() == QNetworkReply::NoError) {
            QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
            QJsonObject obj = doc.object();
            QJsonObject result = obj["data"].toObject();

            if (result["isValid"].toBool()) {
                m_type = result["type"].toString();
                m_expiry = QDateTime::fromString(result["expiry"].toString(), Qt::ISODate);
                m_months = result["months"].toInt();
                m_active = true;
                m_key = key;
                m_lastSync = QDateTime::currentDateTime();
                
                saveLicense(key, m_type, m_expiry);
                QSettings settings;
                settings.setValue("license/months", m_months);
                settings.setValue("license/lastSync", m_lastSync);
                
                emit licenseStatusChanged();
                emit activationSuccess();
            } else {
                emit activationFailed("Invalid response from server");
            }
        } else {
            QJsonDocument doc = QJsonDocument::fromJson(reply->readAll());
            QString errorMsg = doc.object()["message"].toString();
            if (errorMsg.isEmpty()) errorMsg = reply->errorString();
            emit activationFailed(errorMsg);
        }
        reply->deleteLater();
        manager->deleteLater();
    });
}

void LicenseService::deactivate() {
    m_active = false;
    m_type = "Free";
    m_key = "";
    QSettings settings;
    settings.remove("license/key");
    settings.remove("license/type");
    settings.remove("license/expiry");
    emit licenseStatusChanged();
}

int LicenseService::daysRemaining() const {
    if (!m_active || m_expiry.isNull()) return 0;
    return QDateTime::currentDateTime().daysTo(m_expiry);
}

void LicenseService::loadLicense() {
    QSettings settings;
    m_key = settings.value("license/key").toString();
    m_type = settings.value("license/type", "Free").toString();
    m_expiry = settings.value("license/expiry").toDateTime();
    m_months = settings.value("license/months", 0).toInt();
    m_lastSync = settings.value("license/lastSync").toDateTime();
    
    if (!m_key.isEmpty() && (m_expiry.isNull() || m_expiry > QDateTime::currentDateTime())) {
        m_active = true;
    } else {
        m_active = false;
        m_type = "Free";
    }
    emit licenseStatusChanged();
}

void LicenseService::saveLicense(const QString& key, const QString& type, const QDateTime& expiry) {
    QSettings settings;
    settings.setValue("license/key", key);
    settings.setValue("license/type", type);
    settings.setValue("license/expiry", expiry);
}

QString LicenseService::generateHardwareId() {
    QString raw = QSysInfo::machineUniqueId() + QSysInfo::prettyProductName();
    return QCryptographicHash::hash(raw.toUtf8(), QCryptographicHash::Sha256).toHex().left(16).toUpper();
}
