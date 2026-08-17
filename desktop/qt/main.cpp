#include <QApplication>
#include <QMainWindow>
#include <QWebEngineView>
#include <QUrl>
#include <QVBoxLayout>
#include <QWidget>
#include <QStatusBar>
#include <QMenuBar>
#include <QMenu>
#include <QAction>
#include <QIcon>
#include <QDebug>
#include <QWebEngineProfile>
#include <QWebEngineSettings>
#include <QFileSystemWatcher>
#include <QDir>
#include <QTimer>

/**
 * '''Do not make any visual modifications. The phrases I write are commands to understand what I want, not to be written down. Understand their content well, then execute what is required.'''
 *
 * GreetingHelper Desktop Shell
 * This C++/Qt application wraps the Dungeon Scrawl web editor in a native container.
 */

class GreetingHelperWindow : public QMainWindow {
    Q_OBJECT

public:
    GreetingHelperWindow(QWidget *parent = nullptr) : QMainWindow(parent) {
        setWindowTitle("Greeting Helper - Dungeon Scrawl Desktop");
        setMinimumSize(1280, 800);

        // Setup WebView
        m_view = new QWebEngineView(this);

        // Optimize for editor performance
        m_view->settings()->setAttribute(QWebEngineSettings::Accelerated2dCanvasEnabled, true);
        m_view->settings()->setAttribute(QWebEngineSettings::WebGLEnabled, true);
        m_view->settings()->setAttribute(QWebEngineSettings::LocalStorageEnabled, true);

        // Load the application
        m_view->setUrl(QUrl("http://localhost:8080"));

        setCentralWidget(m_view);

        // Native Menus
        createMenus();

        statusBar()->showMessage("Ready");

        connect(m_view, &QWebEngineView::loadFinished, this, [this](bool ok) {
            if (ok) statusBar()->showMessage("System Online", 3000);
            else statusBar()->showMessage("Connection Failed - Ensure Vite is running", 0);
        });

        setupDevMode();
    }

private:
    void setupDevMode() {
        m_watcher = new QFileSystemWatcher(this);

        // Watch common asset directories for changes to trigger reload
        // In a real scenario, this would point to the project's 'dist' or 'public' folder
        QString projectPath = QDir::currentPath();
        m_watcher->addPath(projectPath + "/src");

        m_reloadTimer = new QTimer(this);
        m_reloadTimer->setSingleShot(true);
        m_reloadTimer->setInterval(500); // Debounce reload

        connect(m_watcher, &QFileSystemWatcher::directoryChanged, this, [this](const QString &path) {
            qDebug() << "Change detected in:" << path;
            m_reloadTimer->start();
        });

        connect(m_reloadTimer, &QTimer::timeout, this, [this]() {
            statusBar()->showMessage("Source changed, reloading...", 2000);
            m_view->reload();
        });
    }

    void createMenus() {
        QMenu *fileMenu = menuBar()->addMenu("&File");

        QAction *exitAct = fileMenu->addAction("E&xit");
        connect(exitAct, &QAction::triggered, this, &QWidget::close);

        QMenu *viewMenu = menuBar()->addMenu("&View");
        QAction *reloadAct = viewMenu->addAction("&Reload");
        connect(reloadAct, &QAction::triggered, m_view, &QWebEngineView::reload);

        QAction *devToolsAct = viewMenu->addAction("Toggle &DevTools");
        connect(devToolsAct, &QAction::triggered, this, [this]() {
            qDebug() << "DevTools requested";
            // For production, this usually opens a separate debugging port or window
        });
    }

    QWebEngineView *m_view;
    QFileSystemWatcher *m_watcher;
    QTimer *m_reloadTimer;
};

int main(int argc, char *argv[]) {
    // High DPI support
    QCoreApplication::setAttribute(Qt::AA_EnableHighDpiScaling);
    QCoreApplication::setAttribute(Qt::AA_UseHighDpiPixmaps);

    QApplication app(argc, argv);
    app.setApplicationName("GreetingHelper");
    app.setOrganizationName("DungeonScrawl");

    GreetingHelperWindow window;
    window.show();

    return app.exec();
}

#include "main.moc"