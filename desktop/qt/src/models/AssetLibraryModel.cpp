#include "AssetLibraryModel.h"
#include <QFile>
#include <QJsonDocument>
#include <QDebug>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

AssetLibraryModel::AssetLibraryModel(QObject *parent) : QAbstractListModel(parent) {
}

int AssetLibraryModel::rowCount(const QModelIndex &parent) const {
    return m_filteredAssets.size();
}

QVariant AssetLibraryModel::data(const QModelIndex &index, int role) const {
    if (!index.isValid() || index.row() >= m_filteredAssets.size()) return QVariant();
    const Asset &asset = m_filteredAssets[index.row()];
    if (role == IdRole) return asset.id;
    if (role == NameRole) return asset.name;
    if (role == CategoryRole) return asset.category;
    if (role == IconRole) return asset.iconUrl;
    return QVariant();
}

QHash<int, QByteArray> AssetLibraryModel::roleNames() const {
    QHash<int, QByteArray> roles;
    roles[IdRole] = "assetId";
    roles[NameRole] = "name";
    roles[CategoryRole] = "category";
    roles[IconRole] = "icon";
    return roles;
}

void AssetLibraryModel::loadManifest(const QString& filePath) {
    QFile file(filePath);
    if (file.open(QIODevice::ReadOnly)) {
        QJsonArray arr = QJsonDocument::fromJson(file.readAll()).array();
        m_allAssets.clear();
        for (const QJsonValue &v : arr) {
            QJsonObject obj = v.toObject();
            Asset a;
            a.id = obj["id"].toString();
            a.name = obj["name"].toString();
            a.category = obj["category"].toString();
            a.iconUrl = obj["icon"].toString();
            a.data = obj;
            m_allAssets.append(a);
        }
        updateFilteredAssets();
    }
}

void AssetLibraryModel::setSearchQuery(const QString& query) {
    if (m_searchQuery == query) return;
    m_searchQuery = query;
    updateFilteredAssets();
    emit searchQueryChanged();
}

void AssetLibraryModel::setActiveCategory(const QString& category) {
    if (m_activeCategory == category) return;
    m_activeCategory = category;
    updateFilteredAssets();
    emit activeCategoryChanged();
}

void AssetLibraryModel::updateFilteredAssets() {
    beginResetModel();
    m_filteredAssets.clear();
    for (const auto& asset : m_allAssets) {
        bool matchSearch = m_searchQuery.isEmpty() || asset.name.contains(m_searchQuery, Qt::CaseInsensitive);
        bool matchCategory = m_activeCategory == "All" || asset.category.contains(m_activeCategory, Qt::CaseInsensitive);
        if (matchSearch && matchCategory) {
            m_filteredAssets.append(asset);
        }
    }
    endResetModel();
}
