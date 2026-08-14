#include "AssetLibraryModel.h"
#include <QFile>
#include <QJsonDocument>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 */

AssetLibraryModel::AssetLibraryModel(QObject *parent) : QAbstractListModel(parent) {
}

int AssetLibraryModel::rowCount(const QModelIndex &parent) const {
    return m_assets.size();
}

QVariant AssetLibraryModel::data(const QModelIndex &index, int role) const {
    if (!index.isValid() || index.row() >= m_assets.size()) return QVariant();
    const Asset &asset = m_assets[index.row()];
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
        beginResetModel();
        m_assets.clear();
        QJsonArray arr = QJsonDocument::fromJson(file.readAll()).array();
        for (const QJsonValue &v : arr) {
            QJsonObject obj = v.toObject();
            Asset a;
            a.id = obj["id"].toString();
            a.name = obj["name"].toString();
            a.category = obj["category"].toString();
            a.iconUrl = obj["icon"].toString();
            a.data = obj;
            m_assets.append(a);
        }
        endResetModel();
    }
}
