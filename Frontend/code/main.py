import sys
from PyQt5.QtGui import QIcon
from PyQt5.QtWidgets import * 
from MainWindow import Ui_MainWindow
from CharacterCreatorForm import Ui_Form

LOGO_PATH = r'C:\Users\user\Desktop\my stuff\CharDnD\Frontend\resources\iron_man_logo.png'


class MainWindow(QMainWindow, Ui_MainWindow):
    def __init__(self):
        super().__init__()
        self.initUI()

    def initUI(self):
        self.setupUi(self)

        # Button to toggle theme
        self.toggle_theme_button = QPushButton("Toggle Theme", self)
        self.toggle_theme_button.move(0,0)
        self.toggle_theme_button.clicked.connect(self.toggle_theme)

        self.newCharacterButton.clicked.connect(self.gotoCharacterCreator)
        self.loadCharacterButton.clicked.connect(self.LoadCharacter)

        # Initial theme
        self.is_dark_mode = True
        self.apply_theme()

    def apply_theme(self):
        """Apply the current theme."""
        if self.is_dark_mode:
            self.toggle_theme_button.setText('Light Mode')
            self.setStyleSheet("""
                QMainWindow { background-color: #1b1b1b; color: #f4d35e; }
                QPushButton { background-color: #2c2c2c; color: #f4d35e; border: 2px solid #f4d35e; border-radius: 5px; }
                QPushButton:hover { background-color: #f4d35e; color: #1b1b1b; }
            """)
        else:
            self.toggle_theme_button.setText('Dark Mode')
            self.setStyleSheet("""
                QMainWindow { background-color: #ffffff; color: #000000; }
                QPushButton { background-color: #e0e0e0; color: #000000; border: 2px solid #000000; border-radius: 5px; }
                QPushButton:hover { background-color: #000000; color: #ffffff; }
            """)

    def toggle_theme(self):
        """Toggle between light and dark themes."""
        self.is_dark_mode = not self.is_dark_mode
        self.apply_theme()
    
    def gotoCharacterCreator(self):    
        print("New Character Page")
        new_screen = CharacterCreator()
        widget.addWidget(new_screen)
        widget.removeWidget(widget.currentWidget())

    def LoadCharacter(self):
        print("Load Character Page")
        return

class CharacterCreator(QDialog, Ui_Form):
    def __init__(self):
        super(CharacterCreator, self).__init__()
        self.setupUi(self)   
    

app = QApplication(sys.argv)
widget = QStackedWidget()
widget.setWindowIcon(QIcon(LOGO_PATH))
widget.setWindowTitle('Adventure Companion')
s1 = MainWindow()
widget.resize(1085, 1085)
widget.addWidget(s1)
widget.show()

sys.exit(app.exec_())