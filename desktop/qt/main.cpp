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

/**
 * GreetingHelper Desktop Shell
 * This C++/Qt application wraps the Dungeon Scrawl web editor in a native container.
 * 
 * Requirements:
 * - Qt 6.x
 * - Qt WebEngine module
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
        m_view->setUrl(QUrl("http://localhost:8080")); // Or production URL

        setCentralWidget(m_view);

        // Native Menus
        createMenus();
        
        statusBar()->showMessage("Ready");
        
        connect(m_view, &QWebEngineView::loadFinished, this, [this](bool ok) {
            if (ok) statusBar()->showMessage("System Online", 3000);
            else statusBar()->showMessage("Connection Failed", 0);
        });
    }

private:
    void createMenus() {
        QMenu *fileMenu = menuBar()->addMenu("&File");
        
        QAction *exitAct = fileMenu->addAction("E&xit");
        connect(exitAct, &QAction::triggered, this, &QWidget::close);

        QMenu *viewMenu = menuBar()->addMenu("&View");
        QAction *reloadAct = viewMenu->addAction("&Reload");
        connect(reloadAct, &QAction::triggered, m_view, &QWebEngineView::reload);
        
        QAction *devToolsAct = viewMenu->addAction("Toggle &DevTools");
        connect(devToolsAct, &QAction::triggered, this, [this]() {
            // Implementation for opening a separate devtools window if needed
            qDebug() << "DevTools requested";
        });
    }

    QWebEngineView *m_view;
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
