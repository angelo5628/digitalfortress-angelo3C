1. Nome do Projeto  
Digital Fortress - Cofre Digital de Senhas  

2. Objetivo do Sistema  
Armazenar e gerenciar senhas de forma segura e organizada, substituindo métodos inseguros como anotações em papéis ou memorização.  

3. Público-Alvo / Usuários  
Pessoas que precisam gerenciar múltiplas credenciais de acesso a serviços digitais, como usuários comuns e profissionais.  

4. Funcionalidades Principais  
Armazenar senhas com categorias/tags, gerar senhas seguras, copiar credenciais, filtrar por categorias e exportar/importar dados.  

5. Requisitos Funcionais  
Cadastro de senhas com serviço, usuário e senha; categorização; busca; criptografia básica; modo escuro/claro; confirmação para ações críticas.  

6. Requisitos Não Funcionais  
Responsividade, tempo de carregamento rápido, compatibilidade com navegadores modernos, interface intuitiva e feedback visual claro.  

7. Entradas do Sistema  
Dados de login (serviço, usuário, senha), categoria, tags, senha mestre e filtros de pesquisa.  

8. Saídas do Sistema  
Lista organizada de credenciais, senhas ocultas/mostradas, alertas de confirmação e feedback de operações.  

9. Atores Envolvidos  
Usuário final (único perfil sem hierarquia de acesso).  

10. Casos de Uso ou Cenários  
Usuário adiciona credenciais do banco; recupera senha do e-mail; exporta dados para backup; filtra senhas de trabalho.  

11. Fluxo das Operações  
Acesso → Autenticação com senha mestre → Visualização/Edição → Cópia de credenciais → Bloqueio automático após inatividade.  

12. Restrições de Uso  
Senha mestre obrigatória; mínimo 6 caracteres para senhas; bloqueio após tentativas falhas; tempo limite de sessão.  

14. Plataforma Alvo  
Web (responsiva para desktop e mobile).  

15. Autenticação e Segurança  
Senha mestre única; dados armazenados localmente; senhas ocultas por padrão; confirmação para exclusão.  

16. Armazenamento de Dados  
LocalStorage do navegador (senhas criptografadas em base64); arquivo JSON para exportação.  

17. Layout e Design Desejado  
Interface limpa com categorias visíveis; contraste acessível; temas claro/escuro; ícones intuitivos.  

18. Critérios de Sucesso  
Funcionalidades implementadas sem erros; usuário consegue armazenar/recuperar senhas com eficiência; sistema opera offline.
