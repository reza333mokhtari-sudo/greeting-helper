#pragma once
#include <QAbstractListModel>
#include <QVector>
#include <QString>
#include <QJsonObject>
#include <QJsonArray>
#include <QtQml/qqmlregistration.h>

/**
 * Asset Library List Model
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
    QML_ELEMENT
    Q_PROPERTY(QString searchQuery READ searchQuery WRITE setSearchQuery NOTIFY searchQueryChanged)
    Q_PROPERTY(QString activeCategory READ activeCategory WRITE setActiveCategory NOTIFY activeCategoryChanged)

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
    
    QString searchQuery() const { return m_searchQuery; }
    void setSearchQuery(const QString& query);

    QString activeCategory() const { return m_activeCategory; }
    void setActiveCategory(const QString& category);

signals:
    void searchQueryChanged();
    void activeCategoryChanged();

private:
    void updateFilteredAssets();

    QVector<Asset> m_allAssets;
    QVector<Asset> m_filteredAssets;
    QString m_searchQuery;
    QString m_activeCategory = "All";
};
