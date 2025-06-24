import sqlite3
import json
from datetime import datetime
import os

def init_database():
    db_path = 'communication_data.db'
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS communications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            message TEXT NOT NULL,
            category TEXT,
            profile TEXT,
            mode TEXT
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS USUARIO (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            senha TEXT NOT NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS CONFIGURACOES (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            usa_modoNoturno INTEGER DEFAULT 0,
            tamanhoDaFonte INTEGER DEFAULT 12,
            usar_ajudaVisual INTEGER DEFAULT 0,
            velocidadeMouse INTEGER DEFAULT 5,
            FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS FUNCAO (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            titulo TEXT NOT NULL,
            layout TEXT,
            usuario_id INTEGER NOT NULL,
            FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS CALIBRACAO (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            usuario_id INTEGER NOT NULL,
            data_calibracao TEXT NOT NULL,
            parametros TEXT,
            FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE CASCADE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS SIMBOLO (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            nome TEXT NOT NULL,
            categoria TEXT,
            imagem TEXT,
            funcao_id INTEGER,
            FOREIGN KEY (funcao_id) REFERENCES FUNCAO(id) ON DELETE CASCADE
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS BUSCA (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            termos TEXT,
            filtros TEXT,
            usuario_id INTEGER,
            data_busca TEXT DEFAULT (datetime('now')),
            FOREIGN KEY (usuario_id) REFERENCES USUARIO(id) ON DELETE SET NULL
        )
    ''')

    cursor.execute('''
        CREATE TABLE IF NOT EXISTS phrases (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT NOT NULL,
            complete_phrase TEXT NOT NULL,
            words TEXT,
            word_count INTEGER,
            profile TEXT
        )
    ''')

    conn.commit()
    conn.close()
    return db_path

def save_communication(data):
    conn = sqlite3.connect('communication_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO communications (timestamp, message, category, profile, mode)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data.get('timestamp', datetime.now().isoformat()),
        data.get('message', ''),
        data.get('category', ''),
        data.get('profile', 'Usuario 1'),
        data.get('mode', 'ocular')
    ))
    
    conn.commit()
    conn.close()

def save_phrase(data):
    conn = sqlite3.connect('communication_data.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        INSERT INTO phrases (timestamp, complete_phrase, words, word_count, profile)
        VALUES (?, ?, ?, ?, ?)
    ''', (
        data.get('timestamp', datetime.now().isoformat()),
        data.get('completePhrase', ''),
        json.dumps(data.get('words', [])),
        data.get('wordCount', 0),
        data.get('profile', 'Usuario 1')
    ))
    
    conn.commit()
    conn.close()

def get_communications():
    conn = sqlite3.connect('communication_data.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM communications ORDER BY timestamp DESC')
    communications = cursor.fetchall()
    
    conn.close()
    return communications

def get_phrases():
    conn = sqlite3.connect('communication_data.db')
    cursor = conn.cursor()
    
    cursor.execute('SELECT * FROM phrases ORDER BY timestamp DESC')
    phrases = cursor.fetchall()
    
    conn.close()
    return phrases