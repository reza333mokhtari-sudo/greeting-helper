#include "LicenseService.h"
#include <QSettings>
#include <QCryptographicHash>
#include <QSysInfo>
#include <QDebug>

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

bool LicenseService::activate(const QString& key) {
    qDebug() << "Attempting to activate license with key:" << key;
    
    // In a professional production app, this would call:
    // https://greeting-helper.vercel.app/api/validate?key=...&hwid=...
    
    if (key.startsWith("PRO-") && key.length() > 10) {
        m_type = "Pro";
        m_active = true;
        m_expiry = QDateTime::currentDateTime().addYears(1);
        m_key = key;
        saveLicense(key, m_type, m_expiry);
        emit licenseStatusChanged();
        emit activationSuccess();
        return true;
    } else if (key.startsWith("TRIAL-")) {
        m_type = "Trial";
        m_active = true;
        m_expiry = QDateTime::currentDateTime().addDays(30);
        m_key = key;
        saveLicense(key, m_type, m_expiry);
        emit licenseStatusChanged();
        emit activationSuccess();
        return true;
    } else if (key.startsWith("ENTERPRISE-")) {
        m_type = "Enterprise";
        m_active = true;
        m_expiry = QDateTime::currentDateTime().addYears(3);
        m_key = key;
        saveLicense(key, m_type, m_expiry);
        emit licenseStatusChanged();
        emit activationSuccess();
        return true;
    }
    
    emit activationFailed("Invalid license key. Keys generated via the Web Admin Control Center are required.");
    return false;
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
