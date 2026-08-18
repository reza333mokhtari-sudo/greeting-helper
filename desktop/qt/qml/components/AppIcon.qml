import QtQuick
import QtQuick.Layouts

Item {
    id: root
    
    property string icon: ""
    property color color: "#E0E0E0"
    property int size: 20
    
    property bool hoverEnabled: true
    property bool active: false
    property bool disabled: false
    
    implicitWidth: size
    implicitHeight: size
    
    readonly property color finalColor: {
        if (disabled) return "#666666";
        if (active) return "#3B82F6";
        if (mouseArea.containsMouse && hoverEnabled) return "#FFFFFF";
        return color;
    }

    Behavior on color {
        ColorAnimation { duration: 150 }
    }

    Image {
        id: image
        anchors.fill: parent
        source: icon.startsWith("qrc:/") || icon.startsWith("file:/") ? icon : "qrc:/qt/qml/DungeonEditor/assets/icons/" + icon + ".svg"
        sourceSize.width: size
        sourceSize.height: size
        fillMode: Image.PreserveAspectFit
        smooth: true
        
        // This color overlay works for SVGs in Qt
        layer.enabled: true
        layer.effect: ShaderEffect {
            property color overlayColor: root.finalColor
            fragmentShader: "
                varying highp vec2 qt_TexCoord0;
                uniform lowp sampler2D source;
                uniform lowp float qt_Opacity;
                uniform lowp vec4 overlayColor;
                void main() {
                    lowp vec4 tex = texture2D(source, qt_TexCoord0);
                    gl_FragColor = vec4(overlayColor.rgb, tex.a * qt_Opacity * overlayColor.a);
                }
            "
        }
    }

    MouseArea {
        id: mouseArea
        anchors.fill: parent
        hoverEnabled: root.hoverEnabled
        enabled: !root.disabled
    }
}
