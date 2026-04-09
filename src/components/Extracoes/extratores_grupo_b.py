import re
from helpers import to_float_br, formatar_saldo, limpar_texto

    # GRUPO B
def extrair_dados_GRUPO_B_2022(fatura: list[str]) -> list: # FINALIZADO
    
    # REFERÊNCIAS
    unidade = 0 #OK
    mes_referencia = 0 #OK
    data_leitura = 0 #OK
    
    # TARIFAS
    tarifa_cons_TUSD = 0 #OK
    tarifa_cons_TE = 0 #OK
    tarifa_comp_TUSD = 0 #OK
    tarifa_comp_TE = 0 #OK
    bandeira_vermelha = 0 #OK
    bandeira_amarela= 0 #OK
    tarifa_homologada_TE = 0 #OK
    tarifa_homologada_TUSD =0 #OK
    
    # DADOS DE FATURAMENTO
    consumo = 0 #OK
    energia_injetada = 0 #OK
    credito_utilizado = 0 #OK
    credito_utilizado_real = 0 #OK
    saldo_atualizado = 0 #OK
    
    # DADOS FINANCEIROS
    subtotal_faturamento = 0 #OK
    subtotal_outros = 0 #OK
    tipo_GD = "GD1"
    pag_dup = 0 #OK

    # TRIBUTOS
    pis_pasep = 0 #OK
    cofins = 0 #OK
    icms = 0 #OK 
    cip = 0 #OK
    
    num = 0 #variável de controle global
    
    for texto in fatura:

        if "MONOFÁSICO" in texto or "TRIFÁSICO" in texto or "BIFÁSICO" in texto:
          data_leitura = fatura[num+12]
          mes_referencia = data_leitura[-8:]
        
        if "Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código " in texto:
          unidade = texto.replace("Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código ","") #Número da UC

        if "Energia Ativa Fornecida TE" in texto:
            tarifa_cons_TE = float(fatura[num+5].replace(",",".")) #Tarifa consumo TE
            tarifa_homologada_TE = float(fatura[num+9].replace(",",".")) #Tarifa consumo TE
            consumo = float(fatura[num+2].replace(".","")) #Consumo
        
        if "Energia Ativa Fornecida TUSD" in texto:
            tarifa_cons_TUSD = float(fatura[num+5].replace(",",".")) #Tarifa consumo TUSD
            tarifa_homologada_TUSD = float(fatura[num+9].replace(",",".")) #Tarifa consumo TE

        if "Adicional Band. Vermelha" in texto:
            bandeira_vermelha = float(fatura[num+5].replace(",",".")) #Tarifa consumo TUSD
                  
        if "Adicional Band. Amarela" in texto:
            bandeira_amarela = float(fatura[num+5].replace(",",".")) #Tarifa consumo TUSD

        if "Energia Atv Inj TE" in texto:
            tarifa_comp_TE = float(fatura[num+5].replace("-", "").replace(",",".").replace(f"\n","")) #Tarifa compensação TE
            credito_utilizado = credito_utilizado + float(fatura[num+2].replace(".","")) #Crédito Utilizado

        if "Energia Atv Inj TUSD" in texto:
            tarifa_comp_TUSD = float(fatura[num+5].replace("-", "").replace(",",".").replace(f"\n","")) #Tarifa compensação TUSD
                        
        if "Energia Injetada HFP no mês:" in texto:
            padrao = r"Energia Injetada HFP no mês: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                energia_injetada = formatar_saldo(resultado.group(0).replace(" kWh","").replace("Energia Injetada HFP no mês: ",""))    
            
        if "HFP INJ" in texto:
            if energia_injetada == 0:
                energia_injetada = int(fatura[num+6].replace(".",""))
                energia_injetada = energia_injetada * 10
          
        if "Subtotal Faturamento" in texto:
            subtotal_faturamento = to_float_br(fatura[num+6])
                
        if "Subtotal Outros" in texto:
            subtotal_outros = to_float_br(fatura[num+6])  # Subtotal Outros
            
        if "CIP ILUM PUB PREF MUNICIPAL" in texto:
            cip = float(fatura[num+1].replace(".","").replace(",",".")) #cip

        if "PIS/PASEP" in texto:
            pis_pasep = float(fatura[num+6].replace(".","").replace(",",".")) #pis
            cofins = float(fatura[num+7].replace(".","").replace(",",".")) #cofins    
            icms = float(fatura[num+8].replace(".","").replace(",",".")) #icms

        if "Pagamento Duplicidade/Não Loc" in texto:
            pag_dup = to_float_br(fatura[num+1]) #Devoluções
        
        if "GD2" in texto and tipo_GD == "GD1":
            tipo_GD = "GD2"
        
        if "GD3" in texto and tipo_GD == "GD1":
            tipo_GD = "GD3"
        
        if saldo_atualizado == 0 and "atualizado:" in texto:
            padrao = r"atualizado: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                saldo_atualizado = formatar_saldo(resultado.group(0).replace(" kWh","").replace("atualizado: ",""))
                        
        if credito_utilizado_real == 0 and "Saldo utilizado no mês:" in texto:
            padrao = r"Saldo utilizado no mês: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                credito_utilizado_real = formatar_saldo(resultado.group(0).replace(" kWh","").replace("Saldo utilizado no mês: ",""))
            
        num += 1
                
        dados = (
          unidade, 
           mes_referencia, 
           energia_injetada, 
           data_leitura, 
           consumo,
           credito_utilizado, 
           saldo_atualizado, 
           tarifa_cons_TE, 
           tarifa_comp_TE, 
           tarifa_homologada_TE,
           tarifa_cons_TUSD, 
           tarifa_comp_TUSD,
           tarifa_homologada_TUSD,
           bandeira_amarela, 
           bandeira_vermelha, 
           subtotal_faturamento, 
           credito_utilizado_real,
           pag_dup,
           icms,
           pis_pasep,
           cofins,
           tipo_GD,
           cip,
           subtotal_outros
        )
   
    return dados

def extrair_dados_GRUPO_B_JAN2023_JUL2024(fatura: list[str]) -> list: # FINALIZADO

       
   # REFERÊNCIAS
    unidade = 0 
    mes_referencia = 0 
    data_leitura = 0 
    data_emissao = 0
    
    # TARIFAS
    tarifa_cons_TUSD = 0 
    tarifa_cons_TE = 0 
    tarifa_comp_TUSD = 0 
    tarifa_comp_TE = 0 
    bandeira_vermelha = 0 
    bandeira_amarela= 0 
    tarifa_homologada_TE = 0 
    tarifa_homologada_TUSD =0 
    
    # DADOS DE FATURAMENTO
    consumo = 0 
    energia_injetada = 0 
    credito_utilizado = 0 
    credito_utilizado_real = 0 
    saldo_atualizado = 0 
    
    # DADOS FINANCEIROS
    subtotal_faturamento = 0 
    subtotal_outros = 0 
    tipo_GD = "GD1"
    pag_dup = 0 

    # TRIBUTOS
    pis_pasep = 0 
    cofins = 0 
    icms = 0  
    cip = 0 
    
    num = 0 #variável de controle global
    
    for texto in fatura:

        if "MONOFÁSICO" in texto or "TRIFÁSICO" in texto or "BIFÁSICO" in texto:
          data_leitura = fatura[num+12]
          mes_referencia = data_leitura[-8:]
        
        if "Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código " in texto:
          unidade = texto.replace("Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código ","") #Número da UC

        if "Energia Ativa Fornecida TE" in texto:
            tarifa_cons_TE = float(fatura[num+5].replace(",",".")) #Tarifa consumo TE
            tarifa_homologada_TE = float(fatura[num+9].replace(",",".")) #Tarifa consumo TE
            consumo = float(fatura[num+2].replace(".","")) #Consumo
        
        if "Energia Ativa Fornecida TUSD" in texto:
            tarifa_cons_TUSD = float(fatura[num+5].replace(",",".")) #Tarifa consumo TUSD
            tarifa_homologada_TUSD = float(fatura[num+9].replace(",",".")) #Tarifa consumo TE

        if "Adicional Band. Vermelha" in texto:
            bandeira_vermelha = float(fatura[num+5].replace(",",".")) #Tarifa consumo TUSD
                  
        if "Adicional Band. Amarela" in texto:
            bandeira_amarela = float(fatura[num+5].replace(",",".")) #Tarifa consumo TUSD

        if "Energia Atv Inj TE" in texto:
            tarifa_comp_TE = float(fatura[num+5].replace("-", "").replace(",",".").replace(f"\n","")) #Tarifa compensação TE
            credito_utilizado = credito_utilizado + float(fatura[num+2].replace(".","")) #Crédito Utilizado

        if "Energia Atv Inj TUSD" in texto:
            tarifa_comp_TUSD = float(fatura[num+5].replace("-", "").replace(",",".").replace(f"\n","")) #Tarifa compensação TUSD
                        
        if "Energia Injetada HFP no mês:" in texto:
            padrao = r"Energia Injetada HFP no mês: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                energia_injetada = formatar_saldo(resultado.group(0).replace(" kWh","").replace("Energia Injetada HFP no mês: ",""))    
            
        if "HFP INJ" in texto:
            if energia_injetada == 0:
                energia_injetada = int(fatura[num+6].replace(".",""))
                energia_injetada = energia_injetada * 10
          
        if "Subtotal Faturamento" in texto:
            subtotal_faturamento = to_float_br(fatura[num+6])
                
        if "Subtotal Outros" in texto:
            subtotal_outros = to_float_br(fatura[num+6])  # Subtotal Outros
            
        if "CIP ILUM PUB PREF MUNICIPAL" in texto:
            cip = float(fatura[num+1].replace(".","").replace(",",".")) #cip

        if "PIS/PASEP" in texto:
            pis_pasep = float(fatura[num+6].replace(".","").replace(",",".")) #pis
            cofins = float(fatura[num+7].replace(".","").replace(",",".")) #cofins    
            icms = float(fatura[num+8].replace(".","").replace(",",".")) #icms

        if "Pagamento Duplicidade/Não Loc" in texto:
            pag_dup = to_float_br(fatura[num+1]) #Devoluções
        
        if "GD2" in texto and tipo_GD == "GD1":
            tipo_GD = "GD2"
        
        if "GD3" in texto and tipo_GD == "GD1":
            tipo_GD = "GD3"
        
        if saldo_atualizado == 0 and "atualizado:" in texto:
            padrao = r"atualizado: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                saldo_atualizado = formatar_saldo(resultado.group(0).replace(" kWh","").replace("atualizado: ",""))
                        
        if credito_utilizado_real == 0 and "Saldo utilizado no mês:" in texto:
            padrao = r"Saldo utilizado no mês: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                credito_utilizado_real = formatar_saldo(resultado.group(0).replace(" kWh","").replace("Saldo utilizado no mês: ",""))
            
        num += 1
                
        dados = (
           unidade, 
           mes_referencia, 
           energia_injetada, 
           data_leitura, 
           consumo,
           credito_utilizado, 
           saldo_atualizado, 
           tarifa_cons_TE, 
           tarifa_cons_TUSD, 
           tarifa_comp_TE, 
           tarifa_comp_TUSD,
           bandeira_amarela, 
           bandeira_vermelha, 
           subtotal_faturamento, 
           credito_utilizado_real,
           pag_dup,
           icms,
           pis_pasep,
           cofins,
           tarifa_homologada_TE,
           tarifa_homologada_TUSD,
           tipo_GD,
           cip,
           subtotal_outros
        )
   
    return dados

def extrair_dados_GRUPO_B_AGO2024_HOJE(fatura: list[str]) -> list: # FINALIZADO
    
    # REFERÊNCIAS
    unidade = 0 #OK
    mes_referencia = 0 #OK
    data_leitura = 0 #OK
    
    # TARIFAS
    tarifa_cons_TUSD = 0 #OK
    tarifa_cons_TE = 0 #OK
    tarifa_comp_TUSD = 0 #OK
    tarifa_comp_TE = 0 #OK
    bandeira_vermelha = 0 #OK
    bandeira_amarela= 0 #OK
    tarifa_homologada_TE = 0 #OK
    tarifa_homologada_TUSD =0 #OK
    
    # DADOS DE FATURAMENTO
    consumo = 0 #OK
    energia_injetada = 0 #OK
    credito_utilizado = 0 #OK
    credito_utilizado_real = 0 #OK
    saldo_atualizado = 0 #OK
    
    # DADOS FINANCEIROS
    subtotal_faturamento = 0 #OK
    subtotal_outros = 0 #OK
    tipo_GD = "GD1"
    pag_dup = 0 #OK

    # TRIBUTOS
    pis_pasep = 0 #OK
    cofins = 0 #OK
    icms = 0 #OK 
    cip = 0 #OK
    
    num = 0 #variável de controle global
    
    for texto in fatura:

        if "MONOFÁSICO" in texto or "TRIFÁSICO" in texto or "BIFÁSICO" in texto:
          data_leitura = fatura[num+2]
          mes_referencia = data_leitura[-8:]
        
        if "Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código " in texto:
          unidade = texto.replace("Se você ainda não tem débito automático, cadastra-se na sua instituição bancária utilizando o código ","") #Número da UC

        if "Energia Ativa Fornecida TE" in texto:
            tarifa_cons_TE = float(fatura[num+3].replace(",",".")) #Tarifa consumo TE
            tarifa_homologada_TE = float(fatura[num+9].replace(",",".")) #Tarifa consumo TE
        
        if "FATURADO (kWh)" in texto:
            consumo = float(fatura[num+3].replace(".","")) #Consumo

        if "Energia Consumida Faturada TE" in texto:
            faturado = float(fatura[num+2].replace(".",""))
            
        if "Energia Ativa Fornecida TUSD" in texto:
            tarifa_cons_TUSD = float(fatura[num+3].replace(",",".")) #Tarifa consumo TUSD
            tarifa_homologada_TUSD = float(fatura[num+9].replace(",",".")) #Tarifa consumo TE

        if "Adicional Band. Vermelha" in texto:
            bandeira_vermelha = float(fatura[num+3].replace(",",".")) #Tarifa consumo TUSD
                  
        if "Adicional Band. Amarela" in texto:
            bandeira_amarela = float(fatura[num+3].replace(",",".")) #Tarifa consumo TUSD

        if "Energia Atv Inj TE" in texto:
            tarifa_comp_TE = float(fatura[num+3].replace("-", "").replace(",",".").replace(f"\n","")) #Tarifa compensação TE
            credito_utilizado = credito_utilizado + float(fatura[num+2].replace(".","")) #Crédito Utilizado

        if "Energia Atv Inj TUSD" in texto:
            tarifa_comp_TUSD = float(fatura[num+3].replace("-", "").replace(",",".").replace(f"\n","")) #Tarifa compensação TUSD
                        
        if "Energia Injetada HFP no mês:" in texto:
            padrao = r"Energia Injetada HFP no mês: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                energia_injetada = formatar_saldo(resultado.group(0).replace(" kWh","").replace("Energia Injetada HFP no mês: ",""))    
            
        if "HFP INJ" in texto:
            if energia_injetada == 0:
                energia_injetada = int(fatura[num+6].replace(".",""))
                energia_injetada = energia_injetada * 10
          
        if "Subtotal Faturamento" in texto:
            subtotal_faturamento = to_float_br(fatura[num+6])
                
        if "Subtotal Outros" in texto:
            subtotal_outros = to_float_br(fatura[num+1])  # Subtotal Outros
            
        if "CIP ILUM PUB PREF MUNICIPAL" in texto:
            cip = float(fatura[num+1].replace(".","").replace(",",".")) #cip

        if " PIS/PASEP" in texto:
            pis_pasep = float(fatura[num+2].replace(".","").replace(",",".")) #pis

        if " COFINS" in texto:  
            cofins = float(fatura[num+2].replace(".","").replace(",",".")) #cofins

        if " I CMS" in texto:    
            icms = float(fatura[num+2].replace(".","").replace(",",".")) #icms

        if "Pagamento Duplicidade/Não Loc" in texto:
            pag_dup = to_float_br(fatura[num+1]) #Devoluções
        
        if "GD2" in texto and tipo_GD == "GD1":
            tipo_GD = "GD2"
        
        if "GD3" in texto and tipo_GD == "GD1":
            tipo_GD = "GD3"
        
        if saldo_atualizado == 0 and "atualizado:" in texto:
            padrao = r"atualizado: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                saldo_atualizado = formatar_saldo(resultado.group(0).replace(" kWh","").replace("atualizado: ",""))
                        
        if credito_utilizado_real == 0 and "Saldo utilizado no mês:" in texto:
            padrao = r"Saldo utilizado no mês: ([\d.,]+) kWh"
            resultado = re.search(padrao, texto)
            if resultado:
                credito_utilizado_real = formatar_saldo(resultado.group(0).replace(" kWh","").replace("Saldo utilizado no mês: ",""))
            
        num += 1
                
        dados = (

          unidade, 
           mes_referencia, 
           energia_injetada, 
           data_leitura, 
           consumo,
           faturado,
           credito_utilizado, 
           saldo_atualizado, 
           tarifa_cons_TE, 
           tarifa_cons_TUSD, 
           tarifa_comp_TE, 
           tarifa_comp_TUSD,
           bandeira_amarela, 
           bandeira_vermelha, 
           subtotal_faturamento, 
           credito_utilizado_real,
           pag_dup,
           icms,
           pis_pasep,
           cofins,
           tarifa_homologada_TE,
           tarifa_homologada_TUSD,
           tipo_GD,
           cip,
           subtotal_outros
        )
   
    return dados
