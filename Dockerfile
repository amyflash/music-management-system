# 使用官方 Node.js 镜像
FROM node:20-alpine

# 设置工作目录
WORKDIR /app

# 安装 bash 和 pnpm
RUN apk add --no-cache bash && \
    npm install -g pnpm

# 复制依赖文件
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制项目文件
COPY . .

# 构建项目
RUN pnpm build

# 创建必要的目录
RUN mkdir -p data public/uploads

# 设置目录权限
RUN chmod 755 data public/uploads

# 暴露端口
EXPOSE 5000

# 启动应用
CMD ["pnpm", "start"]
