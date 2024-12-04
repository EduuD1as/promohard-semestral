import os
import json
import mysql.connector
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from webdriver_manager.chrome import ChromeDriverManager
import psutil

# Configurações do Selenium
chrome_options = Options()
chrome_options.add_argument("--headless")
chrome_options.add_argument("--disable-gpu")
chrome_options.add_argument("--no-sandbox")
chrome_options.add_argument("--disable-dev-shm-usage")
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()), options=chrome_options)

# Configuração do banco de dados
db_config = {
    "host": "localhost",
    "user": "root",
    "password": "",
    "database": "Promodb"
}

try:
    conn = mysql.connector.connect(**db_config)
    cursor = conn.cursor()
    print("Conexão com o banco de dados bem-sucedida!")
except mysql.connector.Error as err:
    print(f"Erro ao conectar no banco: {err}")
    exit()

# Carregar as categorias do banco
def carregar_categorias():
    cursor.execute("SELECT id_categoria, nm_categoria FROM T_CATEGORIA")
    categorias = cursor.fetchall()
    print("Categorias carregadas:", categorias)
    return {cat[1].lower(): cat[0] for cat in categorias}

categorias = carregar_categorias()

# Caminho para salvar o arquivo JSON
output_dir = os.path.join(os.getcwd(), 'public', 'data')
os.makedirs(output_dir, exist_ok=True)
json_path = os.path.join(output_dir, 'ssd.json')

# Lista global para armazenar os produtos
produtos_totais = []

# Salvar os produtos no JSON
def salvar_dados_json():
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(produtos_totais, f, ensure_ascii=False, indent=4)
    print(f"Dados salvos no JSON: {json_path}")

# Salvar os produtos no banco de dados, evitando duplicidade
def salvar_dados_no_banco(produtos):
    for produto in produtos:
        try:
            categoria_id = categorias.get("ssd")
            if not categoria_id:
                print(f"Categoria não encontrada para o produto: {produto['nome']}")
                continue

            # Verifica se o produto já existe no banco
            cursor.execute("""
            SELECT COUNT(*) FROM T_PRODUTO 
            WHERE nm_produto = %s AND ds_url_produto = %s
            """, (produto["nome"], produto["link"]))
            resultado = cursor.fetchone()
            if resultado[0] > 0:
                print(f"Produto já existe no banco: {produto['nome']}")
                continue

            # Insere o produto no banco
            cursor.execute("""
            INSERT INTO T_PRODUTO (id_categoria, ds_url_imagem, nm_produto, vl_produto, ds_url_produto) 
            VALUES (%s, %s, %s, %s, %s)
            """, (
                categoria_id,
                produto["img"],
                produto["nome"],
                produto["preco"],
                produto["link"]
            ))
            print(f"Produto inserido no banco: {produto['nome']}")
        except mysql.connector.Error as err:
            print(f"Erro ao inserir o produto '{produto['nome']}': {err}")
            continue
    conn.commit()

# Função para extrair produtos
def extrair_produtos(driver):
    produtos = []
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'a.sc-27518a44-4.kVoakD.productLink')))
    items = driver.find_elements(By.CSS_SELECTOR, 'a.sc-27518a44-4.kVoakD.productLink')
    for item in items:
        try:
            img = item.find_element(By.CSS_SELECTOR, 'img.imageCard').get_attribute('src')
            nome = item.find_element(By.CSS_SELECTOR, 'span.sc-d79c9c3f-0.nlmfp.sc-27518a44-9.iJKRqI.nameCard').text
            preco = item.find_element(By.CSS_SELECTOR, 'span.sc-57f0fd6e-2.hjJfoh.priceCard').text
            link = item.get_attribute('href')

            produtos.append({
                "img": img,
                "nome": nome,
                "preco": preco,
                "link": link
            })
        except Exception as e:
            print(f"Erro ao extrair dados: {e}")
            continue
    return produtos

# URL para scraping
url = 'https://www.kabum.com.br/hardware/ssd-2-5'
driver.get(url)

# Contador de páginas
pagina = 1

# Extração de todas as páginas
while True:
    try:
        produtos = extrair_produtos(driver)
        produtos_totais.extend(produtos)

        salvar_dados_json()
        salvar_dados_no_banco(produtos)

        # Avançar para a próxima página
        botao_proxima_pagina = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'a.nextLink'))
        )
        driver.execute_script("arguments[0].click();", botao_proxima_pagina)
        WebDriverWait(driver, 15).until(EC.staleness_of(botao_proxima_pagina))

        pagina += 1
    except Exception as e:
        print("Fim das páginas ou erro:", e)
        break

# Função para matar os processos do Chrome
def kill_chrome_processes():
    for process in psutil.process_iter(attrs=['pid', 'name']):
        if process.info['name'] == 'chrome' or process.info['name'] == 'chromedriver':
            psutil.Process(process.info['pid']).terminate()
    print("Todos os processos do Chrome foram terminados.")

# Encerrar o driver e a conexão com o banco
driver.quit()
kill_chrome_processes()
conn.close()
