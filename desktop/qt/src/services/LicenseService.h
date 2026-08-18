#ifndef LICENSESERVICE_H
#define LICENSESERVICE_H

#include <QObject>
#include <QString>
#include <QDateTime>
#include <QtQml/qqmlregistration.h>

class LicenseService : public QObject {
    Q_OBJECT
    QML_ELEMENT
    Q_PROPERTY(QString licenseType READ licenseType NOTIFY licenseStatusChanged)
    Q_PROPERTY(bool isActive READ isActive NOTIFY licenseStatusChanged)
    Q_PROPERTY(QDateTime expiryDate READ expiryDate NOTIFY licenseStatusChanged)
    Q_PROPERTY(int monthsDuration READ monthsDuration NOTIFY licenseStatusChanged)
    Q_PROPERTY(QDateTime lastSyncTime READ lastSyncTime NOTIFY licenseStatusChanged)
    Q_PROPERTY(QString hardwareId READ hardwareId CONSTANT)
    Q_PROPERTY(bool isSyncing READ isSyncing NOTIFY isSyncingChanged)

public:
    explicit LicenseService(QObject *parent = nullptr);

    enum LicenseType {
        Free,
        Trial,
        Pro,
        Enterprise
    };
    Q_ENUM(LicenseType)

    QString licenseType() const;
    bool isActive() const;
    QDateTime expiryDate() const;
    QString hardwareId() const;

    Q_INVOKABLE bool activate(const QString& key);
    Q_INVOKABLE void deactivate();
    Q_INVOKABLE int daysRemaining() const;

signals:
    void licenseStatusChanged();
    void activationSuccess();
    void activationFailed(const QString& reason);

private:
    void loadLicense();
    void saveLicense(const QString& key, const QString& type, const QDateTime& expiry);
    QString generateHardwareId();

    QString m_key;
    QString m_type = "Free";
    QDateTime m_expiry;
    bool m_active = false;
    QString m_hwid;
};

#endif // LICENSESERVICE_H
