// 等待DOM加载完成
document.addEventListener("DOMContentLoaded", function () {
  // 为所有游戏卡片添加点击事件
  const gameCards = document.querySelectorAll(".game-card");

  gameCards.forEach((card) => {
    card.addEventListener("click", function () {
      // 获取当前卡片中的游戏名称
      const gameName = this.querySelector("h3").textContent;
      // 跳转到游戏详情页
      window.location.href =
        "game-detail.html?game=" + encodeURIComponent(gameName);
    });
  });

  // 添加按钮点击效果
  const buttons = document.querySelectorAll("button, .btn-detail");

  buttons.forEach((button) => {
    button.addEventListener("click", function (e) {
      // 防止事件冒泡
      e.stopPropagation();

      // 创建涟漪效果
      const ripple = document.createElement("span");
      ripple.classList.add("ripple");
      this.appendChild(ripple);

      // 设置涟漪效果的位置
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      ripple.style.width = ripple.style.height = `${size}px`;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;

      // 动画结束后移除元素
      setTimeout(() => {
        ripple.remove();
      }, 600);

      // 按钮点击反馈
      if (this.classList.contains("btn-submit")) {
        showToast("视频上传功能即将上线，敬请期待！");
      } else if (this.classList.contains("btn-leaderboard")) {
        showToast("正在加载收入榜数据...");
      }
    });
  });

  // 处理详情页面的参数
  if (window.location.pathname.includes("game-detail.html")) {
    const urlParams = new URLSearchParams(window.location.search);
    const gameName = urlParams.get("game");

    if (gameName) {
      document.title = `${gameName} - 游戏详情 | 星火发行人计划`;
      // 更新页面中的游戏名称
      const gameTitle = document.querySelector(".back-button a");
      if (gameTitle) {
        gameTitle.innerHTML = `<i class="fas fa-arrow-left"></i> ${gameName}`;
      }
    }
  }

  // 为导航栏添加滚动效果
  const header = document.querySelector("header");
  let lastScrollTop = 0;

  window.addEventListener("scroll", function () {
    let scrollTop = window.pageYOffset || document.documentElement.scrollTop;

    if (scrollTop > lastScrollTop && scrollTop > 100) {
      // 向下滚动，隐藏导航栏
      header.style.transform = "translateY(-100%)";
    } else {
      // 向上滚动，显示导航栏
      header.style.transform = "translateY(0)";
    }

    lastScrollTop = scrollTop;
  });

  // 为统计数据添加数字滚动动画
  animateNumbers();

  // 处理视频上传流程
  setupVideoUploadFlow();
});

// 显示提示框
function showToast(message) {
  // 检查是否已存在toast
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.classList.add("toast");
    document.body.appendChild(toast);
  }

  // 设置消息内容
  toast.textContent = message;
  toast.classList.add("show");

  // 3秒后隐藏
  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// 数字滚动动画
function animateNumbers() {
  const statElements = document.querySelectorAll(".stat-value, .stat-box h3");

  statElements.forEach((element) => {
    const targetValue = element.textContent;

    // 检查是否是带单位的数字，如 8.8W
    const hasUnit = isNaN(targetValue.slice(-1));
    let unit = "";
    let value = targetValue;

    if (hasUnit) {
      unit = targetValue.slice(-1);
      value = targetValue.slice(0, -1);
    }

    // 是否包含小数点
    const isDecimal = value.includes(".");

    // 设置初始值为0
    element.textContent = isDecimal ? "0.0" + unit : "0" + unit;

    // 动画目标值
    let target = parseFloat(value);
    let count = 0;
    let step = target / 50; // 50次更新

    // 创建动画
    const counter = setInterval(() => {
      count += step;

      if (count >= target) {
        count = target;
        clearInterval(counter);
      }

      // 格式化显示
      if (isDecimal) {
        element.textContent = count.toFixed(1) + unit;
      } else {
        element.textContent = Math.floor(count) + unit;
      }
    }, 20);
  });
}

// 添加必要的CSS样式
const style = document.createElement("style");
style.textContent = `
    /* 按钮涟漪效果 */
    button, .btn-detail {
        position: relative;
        overflow: hidden;
    }
    
    .ripple {
        position: absolute;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.4);
        transform: scale(0);
        animation: ripple 0.6s linear;
        pointer-events: none;
    }
    
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    /* 提示框样式 */
    .toast {
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%) translateY(100px);
        background-color: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-size: 16px;
        z-index: 10000;
        opacity: 0;
        transition: transform 0.3s ease, opacity 0.3s ease;
    }
    
    .toast.show {
        transform: translateX(-50%) translateY(0);
        opacity: 1;
    }
    
    /* 导航栏过渡效果 */
    header {
        transition: transform 0.3s ease;
    }
`;

document.head.appendChild(style);

// 视频上传流程处理
function setupVideoUploadFlow() {
  // 获取按钮和弹窗元素
  const uploadBtn = document.getElementById("upload-video-btn");
  const requirementsModal = document.getElementById("requirements-modal");
  const uploadModal = document.getElementById("upload-modal");
  const successModal = document.getElementById("success-modal");

  // 如果不在视频上传页面，直接返回
  if (!uploadBtn) return;

  // 点击上传按钮显示要求提示弹窗
  uploadBtn.addEventListener("click", function () {
    showModal(requirementsModal);
  });

  // 确认要求后显示上传信息弹窗
  const confirmRequirementsBtn = document.getElementById(
    "confirm-requirements"
  );
  confirmRequirementsBtn.addEventListener("click", function () {
    hideModal(requirementsModal);
    showModal(uploadModal);
  });

  // 提交上传表单
  const submitUploadBtn = document.getElementById("submit-upload");
  submitUploadBtn.addEventListener("click", function () {
    // 验证表单
    if (validateUploadForm()) {
      hideModal(uploadModal);
      showModal(successModal);
    }
  });

  // 关闭成功弹窗
  const successConfirmBtn = document.getElementById("success-confirm");
  successConfirmBtn.addEventListener("click", function () {
    hideModal(successModal);
  });

  // 为所有关闭按钮添加事件
  const closeButtons = document.querySelectorAll(".close-modal");
  closeButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      hideModal(modal);
    });
  });

  // 为所有取消按钮添加事件
  const cancelButtons = document.querySelectorAll(".modal-cancel");
  cancelButtons.forEach(function (button) {
    button.addEventListener("click", function () {
      const modal = this.closest(".modal");
      hideModal(modal);
    });
  });

  // 点击弹窗外部关闭弹窗
  window.addEventListener("click", function (event) {
    if (event.target.classList.contains("modal")) {
      hideModal(event.target);
    }
  });
}

// 显示弹窗
function showModal(modal) {
  if (!modal) return;
  modal.style.display = "block";
  document.body.style.overflow = "hidden"; // 防止背景滚动
}

// 隐藏弹窗
function hideModal(modal) {
  if (!modal) return;
  modal.style.display = "none";
  document.body.style.overflow = ""; // 恢复背景滚动
}

// 验证上传表单
function validateUploadForm() {
  const platformSelected = document.querySelector(
    'input[name="platform"]:checked'
  );
  const videoLink = document.getElementById("video-link").value.trim();
  const videoTitle = document.getElementById("video-title").value.trim();
  const sceid = document.getElementById("sceid").value.trim();
  const contact = document.getElementById("contact").value.trim();

  // 检查是否选择了平台
  if (!platformSelected) {
    showToast("请选择投稿平台");
    return false;
  }

  // 检查视频链接
  if (!videoLink) {
    showToast("请输入视频链接");
    return false;
  }

  // 检查视频标题
  if (!videoTitle) {
    showToast("请输入视频标题");
    return false;
  }

  // 验证标题中是否包含必要标签
  if (
    !videoTitle.includes("#TapTap游戏") &&
    !videoTitle.includes("# TapTap游戏")
  ) {
    showToast("视频标题必须包含 #TapTap游戏 标签");
    return false;
  }

  // 检查SCEId
  if (!sceid) {
    showToast("请输入您的SCEId");
    return false;
  }

  // 检查联系方式
  if (!contact) {
    showToast("请输入联系方式");
    return false;
  }

  return true;
}
