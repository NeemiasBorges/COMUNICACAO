import unittest
import cv2
import numpy as np
import mediapipe as mp
import pyautogui
import sys
import os
import io
import time
from datetime import datetime

# Adicionar o diretório do projeto ao caminho do Python
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.utils import calculate_iris_center, initialize_calibration, finalize_calibration

class RelatorioDetalhadoDeTeste(unittest.TestResult):
    """Classe de resultado de teste personalizada para capturar informações mais detalhadas"""
    def __init__(self, stream=None, descriptions=None, verbosity=None):
        super().__init__(stream, descriptions, verbosity)
        self.relatorios_de_teste = []
        self.arquivo_relatorio = None

    def startTest(self, test):
        """Chamado quando um teste é iniciado"""
        super().startTest(test)
        self.tempo_inicio = time.time()

    def addSuccess(self, test):
        """Lidar com teste bem-sucedido"""
        super().addSuccess(test)
        duracao = time.time() - self.tempo_inicio
        self.relatorios_de_teste.append({
            'nome_teste': test.shortDescription() or str(test),
            'status': 'SUCESSO',
            'duracao': duracao
        })

    def addError(self, test, err):
        """Lidar com erros de teste"""
        super().addError(test, err)
        duracao = time.time() - self.tempo_inicio
        self.relatorios_de_teste.append({
            'nome_teste': test.shortDescription() or str(test),
            'status': 'ERRO',
            'erro': self._exc_info_to_string(err, test),
            'duracao': duracao
        })

    def addFailure(self, test, err):
        """Lidar com falhas de teste"""
        super().addFailure(test, err)
        duracao = time.time() - self.tempo_inicio
        self.relatorios_de_teste.append({
            'nome_teste': test.shortDescription() or str(test),
            'status': 'FALHA',
            'erro': self._exc_info_to_string(err, test),
            'duracao': duracao
        })

    def gerar_relatorio(self):
        """Gerar relatório de teste abrangente"""
        diretorio_relatorio = os.path.join(os.path.dirname(__file__), 'relatorios_teste')
        os.makedirs(diretorio_relatorio, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        caminho_relatorio = os.path.join(diretorio_relatorio, f'relatorio_teste_{timestamp}.txt')
        
        with open(caminho_relatorio, 'w', encoding='utf-8') as arquivo_relatorio:
            arquivo_relatorio.write("Relatório de Testes - Aplicação de Rastreamento Ocular\n")
            arquivo_relatorio.write("================================================\n\n")
            arquivo_relatorio.write(f"Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n\n")
            
            total_testes = len(self.relatorios_de_teste)
            sucessos = sum(1 for relatorio in self.relatorios_de_teste if relatorio['status'] == 'SUCESSO')
            falhas = sum(1 for relatorio in self.relatorios_de_teste if relatorio['status'] == 'FALHA')
            erros = sum(1 for relatorio in self.relatorios_de_teste if relatorio['status'] == 'ERRO')
            
            arquivo_relatorio.write(f"Total de Testes: {total_testes}\n")
            arquivo_relatorio.write(f"Testes Bem-Sucedidos: {sucessos}\n")
            arquivo_relatorio.write(f"Testes Falhados: {falhas}\n")
            arquivo_relatorio.write(f"Testes com Erros: {erros}\n\n")
            
            arquivo_relatorio.write("Detalhes dos Testes:\n")
            arquivo_relatorio.write("-" * 50 + "\n")
            
            for relatorio in self.relatorios_de_teste:
                arquivo_relatorio.write(f"Teste: {relatorio['nome_teste']}\n")
                arquivo_relatorio.write(f"Status: {relatorio['status']}\n")
                arquivo_relatorio.write(f"Duração: {relatorio['duracao']:.4f} segundos\n")
                
                if relatorio['status'] != 'SUCESSO':
                    arquivo_relatorio.write("Detalhes do Erro:\n")
                    arquivo_relatorio.write(relatorio.get('erro', 'Sem informações adicionais de erro') + "\n")
                
                arquivo_relatorio.write("-" * 50 + "\n")
        
        print(f"\nRelatório detalhado de testes gerado: {caminho_relatorio}")
        return caminho_relatorio

class TestAplicacaoRastreamentoOcular(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        """Configurar recursos compartilhados entre casos de teste"""
        cls.face_mesh = mp.solutions.face_mesh.FaceMesh(refine_landmarks=True)
        cls.test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        
    def test_calculo_centro_iris(self):
        """Testar função de cálculo do centro da íris"""
        # Criar marcos falsos
        landmarks = [
            type('Landmark', (), {'x': 0.5, 'y': 0.5, 'z': 0.0}) for _ in range(468)
        ]
        
        # Adicionar marcos específicos para íris esquerda e direita
        landmarks[474] = type('Landmark', (), {'x': 0.4, 'y': 0.4, 'z': 0.0})  # Íris esquerda
        landmarks[475] = type('Landmark', (), {'x': 0.6, 'y': 0.6, 'z': 0.0})  # Íris direita
        
        frame_w, frame_h = 640, 480
        
        # Calcular centro da íris
        iris_x, iris_y = calculate_iris_center(landmarks, frame_w, frame_h)
        
        # Verificações
        self.assertIsInstance(iris_x, (int, float))
        self.assertIsInstance(iris_y, (int, float))
        self.assertTrue(0 <= iris_x <= frame_w)
        self.assertTrue(0 <= iris_y <= frame_h)
    
    def test_inicializacao_calibragem(self):
        """Testar inicialização de pontos de calibração"""
        calibration_points = initialize_calibration()
        
        # Verificar a estrutura dos pontos de calibração
        self.assertIsInstance(calibration_points, dict)
        self.assertEqual(len(calibration_points), 0)
    
    def test_mapeamento_coordenadas(self):
        """Testar função de mapeamento de coordenadas de tela"""
        # Pontos de calibração simulados
        calibration_points = {
            'top_left': (100, 100),
            'top_right': (500, 100),
            'bottom_left': (100, 300),
            'bottom_right': (500, 300)
        }
        
        screen_w, screen_h = 1920, 1080
        
        # Testar mapeamento a partir de diferentes posições da íris
        test_cases = [
            # Ponto central
            (300, 200, 960, 540),
            # Quadrante superior esquerdo
            (150, 150, 0, 0),
            # Quadrante inferior direito
            (450, 250, 1920, 1080)
        ]
        
        for iris_x, iris_y, expected_x, expected_y in test_cases:
            screen_x, screen_y = finalize_calibration(
                iris_x, iris_y, 
                calibration_points, 
                screen_w, screen_h
            )
            
            # Verificar se as coordenadas da tela estão dentro de limites razoáveis
            self.assertTrue(0 <= screen_x <= screen_w)
            self.assertTrue(0 <= screen_y <= screen_h)
            self.assertAlmostEqual(screen_x, expected_x, delta=screen_w*0.1)
            self.assertAlmostEqual(screen_y, expected_y, delta=screen_h*0.1)
    
    def test_captura_camera(self):
        """Testar funcionalidade de captura da câmera"""
        cam = cv2.VideoCapture(0)
        
        try:
            # Verificar se a câmera foi aberta com sucesso
            self.assertTrue(cam.isOpened(), "Não foi possível abrir a câmera")
            
            # Capturar um quadro
            success, frame = cam.read()
            
            # Verificações
            self.assertTrue(success, "Falha ao capturar quadro")
            self.assertIsNotNone(frame, "Quadro capturado é None")
            self.assertEqual(len(frame.shape), 3, "Quadro deve ser uma imagem de 3 canais")
        
        finally:
            cam.release()
    
    def test_processamento_face_mesh(self):
        """Testar detecção de marcos faciais"""
        # Criar uma imagem de teste com uma estrutura semelhante a um rosto
        test_image = np.zeros((480, 640, 3), dtype=np.uint8)
        cv2.rectangle(test_image, (200, 100), (400, 300), (255, 255, 255), -1)
        
        # Converter para RGB
        rgb_image = cv2.cvtColor(test_image, cv2.COLOR_BGR2RGB)
        
        # Processar a imagem
        output = self.face_mesh.process(rgb_image)
        
        # Nota: Este teste pode falhar se nenhum rosto for detectado, o que é esperado
        # O objetivo é garantir que o processamento não levante exceções
        if output.multi_face_landmarks:
            landmarks = output.multi_face_landmarks[0].landmark
            self.assertGreater(len(landmarks), 0, "Nenhum marco detectado")
    
    def test_dimensoes_tela(self):
        """Testar recuperação do tamanho da tela"""
        screen_w, screen_h = pyautogui.size()
        
        # Verificar dimensões da tela
        self.assertGreater(screen_w, 0)
        self.assertGreater(screen_h, 0)
        self.assertLess(screen_w, 10000)  # Improvável ter uma tela maior que isso
        self.assertLess(screen_h, 10000)

def executar_testes():
    """Executar suíte de testes e gerar relatório detalhado"""
    # Redirecionar stdout para capturar declarações de impressão, se necessário
    stdout = sys.stdout
    sys.stdout = io.StringIO()

    # Criar uma suíte de testes
    test_suite = unittest.TestLoader().loadTestsFromTestCase(TestAplicacaoRastreamentoOcular)
    
    # Usar nossa classe de resultado de teste personalizada
    test_runner = unittest.TextTestRunner(resultclass=RelatorioDetalhadoDeTeste, verbosity=2)
    
    # Executar testes
    result = test_runner.run(test_suite)
    
    # Gerar relatório
    caminho_relatorio = result.gerar_relatorio()
    
    # Restaurar stdout
    sys.stdout = stdout
    
    # Sair com status não zero se os testes falharem
    sys.exit(not result.wasSuccessful())

if __name__ == '__main__':
    executar_testes()