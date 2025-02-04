#
# App To create a DnD Character
#
# author: darthmendes
# date: 2025-02-04
# version: 1.0.0
#
from PyQt5 import QtWidgets, uic
import sys

ui_path = 'ui'
class Ui(QtWidgets.QMainWindow):
    def __init__(self):
        super(Ui, self).__init__()
        uic.loadUi(ui_path + '/' + 'main_window.ui', self)
        self.show()

app = QtWidgets.QApplication(sys.argv)
window = Ui()
app.exec_()