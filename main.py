import sys
from PyQt5 import QtWidgets, QtGui
from PyQt5.QtWidgets import *

logo_path = r'Frontend\resources\dnd_logo.png'

class MainWindow(QDialog):
    def __init__(self):
        super(MainWindow, self).__init__()
        self.initUI()

    def initUI(self):
        self.setWindowTitle('Adventure Companion')
        self.setWindowIcon(QtGui.QIcon(logo_path))

        #set a button and an on click function
        self.button = QtWidgets.QPushButton('New Character', self)
        self.button.move(100, 100)
        self.button.clicked.connect(self.gotoCharacterCreator)

        self.button2 = QtWidgets.QPushButton('Load Character', self)
        self.button2.move(100, 150)
        self.button2.clicked.connect(self.gotoCharacterCreator)

    def gotoCharacterCreator(self):
        new_screen = CharacterCreator()
        widget.addWidget(new_screen)
        widget.removeWidget(widget.currentWidget())


class CharacterCreator(QDialog):
    def __init__(self):
        super(CharacterCreator, self).__init__()
        self.initUI()
    
    def initUI(self):
        # creating a group box
        self.formGroupBox = QGroupBox("Character Creator")
        
        self.levelSpinBox = QSpinBox()
        self.levelSpinBox.setRange(1, 20)
        self.levelSpinBox.setValue(1)

        self.classComboBox = QComboBox()
        self.classComboBox.addItems(["Ranger", "Paladin", "Druid"])

        self.speciesComboBox = QComboBox()
        self.speciesComboBox.addItems(["Human", "Elf", "Dwarf"])
        
        self.nameLineEdit = QLineEdit()

        # ability scores Horizontal Values
        self.abilityScoreHbox = QHBoxLayout()
        self.STRspinBox = self.createAbilityScoreBox() 
        self.DEXspinBox = self.createAbilityScoreBox()
        self.CONspinBox = self.createAbilityScoreBox()
        self.INTspinBox = self.createAbilityScoreBox()
        self.WISspinBox = self.createAbilityScoreBox()
        self.CHAspinBox = self.createAbilityScoreBox()

        self.abilityScoreHbox.addWidget(self.STRspinBox)
        self.abilityScoreHbox.addWidget(self.DEXspinBox)
        self.abilityScoreHbox.addWidget(self.CONspinBox)
        self.abilityScoreHbox.addWidget(self.INTspinBox)
        self.abilityScoreHbox.addWidget(self.WISspinBox)
        self.abilityScoreHbox.addWidget(self.CHAspinBox)



        # calling the method that create the form
        self.createForm()

        # creating a dialog button for ok and cancel
        self.buttonBox = QDialogButtonBox(QDialogButtonBox.Ok | QDialogButtonBox.Cancel)
        self.buttonBox.accepted.connect(self.getInfo)
        self.buttonBox.rejected.connect(self.gotoHome)

        # creating a vertical layout
        mainLayout = QVBoxLayout()

        # adding form group box to the layout
        mainLayout.addWidget(self.formGroupBox)
        mainLayout.addWidget(self.buttonBox)
        
        # setting lay out
        self.setLayout(mainLayout)
    
    def gotoHome(self):
        new_screen = MainWindow()
        widget.addWidget(new_screen)
        widget.removeWidget(widget.currentWidget())

	# get info method called when form is accepted
    def getInfo(self):

		# printing the form information
        print("Name : {0} Species : {1}".format(self.nameLineEdit.text(),self.speciesComboBox.currentText()))
        print("Level : {0} Class: {1}".format(self.levelSpinBox.text(), self.classComboBox.currentText()))
        print("Ability Scores : STR - {0} DEX - {1} CON - {2} INT - {3} WIS - {4} CHA - {5}".format(self.STRspinBox.value(), self.DEXspinBox.value(), 
                                                    self.CONspinBox.value(), self.INTspinBox.value(), self.WISspinBox.value(), self.CHAspinBox.value()))
        self.gotoHome()

	# create form method
    def createForm(self):

        # creating a form layout
        layout = QFormLayout()

        # adding rows
        # for name and adding input text
        layout.addRow(QLabel("Name: "), self.nameLineEdit)
        layout.addRow(QLabel("Species: "), self.speciesComboBox)
        layout.addRow(QLabel("Level: "), self.levelSpinBox)
        layout.addRow(QLabel("Class: "), self.classComboBox)
        layout.addRow(QLabel("Ability Scores: "), self.abilityScoreHbox)

        # setting layout
        self.formGroupBox.setLayout(layout)

    def createAbilityScoreBox(self):
        aux = QSpinBox()
        aux.setRange(1, 20)
        aux.setValue(10)
        return aux
        



    

app = QApplication(sys.argv)
widget = QStackedWidget()
widget.setWindowIcon(QtGui.QIcon(logo_path))
widget.setWindowTitle('Adventure Companion')
s1 = MainWindow()
widget.addWidget(s1)
widget.setFixedSize(1124, 844)
widget.show()

sys.exit(app.exec_())


