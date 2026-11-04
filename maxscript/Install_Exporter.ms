/*
================================================================================
  INSTALADOR AUTOMÁTICO (DRAG & DROP NA VIEWPORT DO 3DS MAX)
  Arquivo: Install_Exporter.ms
  Instruções: Arraste este arquivo diretamente para dentro da Viewport do 3ds Max.
================================================================================
*/

(
  local currentScriptDir = getFilenamePath (getSourceFileName())
  local sourceExporterFile = currentScriptDir + "ArqVertice_WebExporter.ms"

  if not (doesFileExist sourceExporterFile) then
  (
    messageBox ("O arquivo 'ArqVertice_WebExporter.ms' não foi encontrado na mesma pasta deste instalador:\n\n" + currentScriptDir + "\n\nMantenha ambos os arquivos (.ms) na mesma pasta antes de arrastar para o 3ds Max.") \
      title:"ArqVértice - Erro de Instalação" beep:true
  )
  else
  (
    local userScriptsDir = getDir #userScripts
    local userStartupDir = getDir #userStartupScripts

    local destUserScript = userScriptsDir + "\\ArqVertice_WebExporter.ms"
    local destStartupScript = userStartupDir + "\\ArqVertice_WebExporter.ms"

    -- Remove versões anteriores caso existam
    if doesFileExist destUserScript do deleteFile destUserScript
    if doesFileExist destStartupScript do deleteFile destStartupScript

    -- Copia para userScripts e userStartupScripts (garante que o MacroScript carregue em toda inicialização do 3ds Max)
    copyFile sourceExporterFile destUserScript
    copyFile sourceExporterFile destStartupScript

    -- Compila e registra o MacroScript imediatamente
    fileIn destUserScript

    -- Abre a janela do exportador imediatamente para uso
    try(macros.run "ArqVertice Tools" "ArqVerticeWebExporter") catch()

    local msg = "✅ ArqVértice - Web 3D Exporter instalado com sucesso!\n\n"
    msg += "Arquivos copiados para:\n"
    msg += "• " + destUserScript + "\n"
    msg += "• " + destStartupScript + "\n\n"
    msg += "Como fixar o botão na sua Barra de Ferramentas (Toolbar):\n"
    msg += "1. No menu superior do 3ds Max, acesse: Customize > Customize User Interface...\n"
    msg += "2. Clique na aba 'Toolbars'.\n"
    msg += "3. No menu 'Category', selecione: 'ArqVertice Tools'.\n"
    msg += "4. Arraste a ação 'Exportador Web 3D (ArqVértice)' para qualquer barra de ferramentas da sua interface."

    messageBox msg title:"ArqVértice Tools - Instalação Concluída" beep:false
  )
)
