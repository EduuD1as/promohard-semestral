import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager

# configuração do driver do Chrome
driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))

url = 'https://www.pichau.com.br/hardware/placa-de-video'
driver.get(url)

# função para extrair os dados de cada placa (por página)
def extrair_placas(driver):
    WebDriverWait(driver, 15).until(EC.presence_of_element_located((By.CSS_SELECTOR, 'div.MuiCardContent-root.jss257')))
    placas = driver.find_elements(By.CSS_SELECTOR, 'div.MuiCardContent-root.jss257')
    for placa in placas:
        try:
            #imgPlaca = placa.find_element(By.CSS_SELECTOR, 'img.jss256')
            #imgPlaca = imgPlaca.get_attribute('src')
            #print(imgPlaca)
            
            nomePlaca = placa.find_element(By.CSS_SELECTOR, 'h2.MuiTypography-root.jss277.jss278.MuiTypography-h6')
            print(nomePlaca.text)

            precoPlaca = placa.find_element(By.CSS_SELECTOR, 'div.jss280')
            print(precoPlaca.text)

        except Exception as e:
            print(f"Erro ao extrair dados: {e}")
            continue

# extrai as placas da primeira página
extrair_placas(driver)

# try para navegar nas próximas páginas e extrair as informações das placas
while True:
    try:
        # validação se o botão "Próxima Página" é clicável
        botao_proxima_pagina = WebDriverWait(driver, 15).until(
            EC.element_to_be_clickable((By.CSS_SELECTOR, 'button.MuiButtonBase-root.MuiPaginationItem-root.MuiPaginationItem-page.MuiPaginationItem-textPrimary.MuiPaginationItem-sizeLarge'))
        )
        print("Botão 'Próxima Página' encontrado.")     
        
        # usando JS para clicar diretamente no botão
        driver.execute_script("arguments[0].click();", botao_proxima_pagina)
        print("Botão 'Próxima Página' clicado.")
        
        # aguarda o carregamento da nova página
        WebDriverWait(driver, 15).until(EC.staleness_of(botao_proxima_pagina))
        WebDriverWait(driver, 15).until(
            EC.presence_of_element_located((By.CSS_SELECTOR, 'div.MuiCardContent-root.jss257'))
        )
        print("Nova página carregada.")
        
        # extrai novamente as placas após as validações
        extrair_placas(driver)
    except Exception as e:
        if "element could not be scrolled into view" in str(e):
            print("O botão 'Próxima Página' não pôde ser encontrado.")
        else:
            print("Não há mais páginas para navegar ou ocorreu um erro:", e)
        break