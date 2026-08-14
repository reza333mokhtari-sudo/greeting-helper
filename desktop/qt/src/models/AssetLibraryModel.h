#pragma once
#include <QAbstractListModel>
#include <QVector>
#include <QString>
#include <QJsonObject>
#include <QJsonArray>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

struct Asset {
    QString id;
    QString name;
    QString category;
    QString iconUrl;
    QJsonObject data;
};

class AssetLibraryModel : public QAbstractListModel {
    Q_OBJECT

public:
    enum AssetRoles {
        IdRole = Qt::UserRole + 1,
        NameRole,
        CategoryRole,
        IconRole
    };

    explicit AssetLibraryModel(QObject *parent = nullptr);

    int rowCount(const QModelIndex &parent = QModelIndex()) const override;
    QVariant data(const QModelIndex &index, int role = Qt::DisplayRole) const override;
    QHash<int, QByteArray> roleNames() const override;

    Q_INVOKABLE void loadManifest(const QString& filePath);

private:
    QVector<Asset> m_assets;
};
