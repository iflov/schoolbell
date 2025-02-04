1. 결재 시스템 필요한 테이블 정의

-- 사용자 테이블: 시스템 사용자 정보 관리
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,         -- 사용자 고유 식별자 (자동증가)
    username VARCHAR(50) NOT NULL,                  -- 사용자 이름 (실명)
    department VARCHAR(50),                         -- 소속 부서명
    position VARCHAR(50),                          -- 직위/직급명
    email VARCHAR(100),                            -- 이메일 주소 (알림 발송용)
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 사용자 계정 생성일시
    INDEX idx_email (email),                       -- 이메일 검색용 인덱스
    INDEX idx_username (username),                  -- 이름 검색용 인덱스
    INDEX idx_dept_pos (department, position)       -- 부서/직급 기반 검색 최적화 인덱스
);

-- 결재 문서 테이블: 결재 문서의 기본 정보 관리
CREATE TABLE approval_documents (
    document_id INT AUTO_INCREMENT PRIMARY KEY,     -- 문서 고유 식별자 (자동증가)
    title VARCHAR(200) NOT NULL,                    -- 문서 제목
    content TEXT,                                   -- 문서 본문 내용
    creator_id INT,                                -- 문서 작성자 ID (외래키)
    document_status ENUM(
    'DRAFT',                                   -- 작성 중인 상태
    'SUBMITTED',                               -- 결재 상신된 상태
    'IN_PROGRESS',                             -- 결재 진행 중인 상태
    'COMPLETED',                               -- 결재 완료된 상태
    'REJECTED'                                 -- 결재 반려된 상태
    ) DEFAULT 'DRAFT',                          -- 결재 상태
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- 문서 생성일시
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,  -- 문서 수정일시
    FOREIGN KEY (creator_id) REFERENCES users(user_id) ON DELETE RESTRICT,     -- 작성자 삭제 제한
    INDEX idx_creator_status (creator_id, document_status),  -- 작성자별 문서상태 조회용 인덱스
    INDEX idx_status_date (document_status, created_at)      -- 상태별 시간순 조회용 인덱스
);

-- 결재라인 테이블: 결재 과정 및 이력 관리
CREATE TABLE approval_lines (
    line_id INT AUTO_INCREMENT PRIMARY KEY,         -- 결재라인 고유 식별자
    document_id INT,                               -- 대상 문서 ID
    approver_id INT,                               -- 현재 결재자 ID
    original_approver_id INT,                      -- 원본 결재자 ID (위임 전)
    approval_order INT NOT NULL,                   -- 결재 순서 (1부터 시작)
    approval_status ENUM(
    'WAITING',                                -- 결재 대기 상태
    'IN_PROGRESS',                            -- 결재 검토 중
    'APPROVED',                               -- 결재 승인됨
    'REJECTED',                               -- 결재 반려됨
    'DELEGATED'                               -- 다른 결재자에게 위임됨
    ) DEFAULT 'WAITING',                    -- 결재 상태
    approval_comment TEXT,                         -- 결재 의견/답변
    delegated_to INT,                             -- 위임받은 사용자 ID
    received_at DATETIME,                         -- 결재 수신 일시
    processed_at DATETIME,                        -- 결재 처리 일시
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 결재라인 생성일시
    FOREIGN KEY (document_id) REFERENCES approval_documents(document_id) ON DELETE CASCADE,  -- 문서 삭제시 함께 삭제
    FOREIGN KEY (approver_id) REFERENCES users(user_id) ON DELETE RESTRICT,                 -- 결재자 삭제 제한
    FOREIGN KEY (original_approver_id) REFERENCES users(user_id) ON DELETE RESTRICT,        -- 원결재자 삭제 제한
    FOREIGN KEY (delegated_to) REFERENCES users(user_id) ON DELETE SET NULL,               -- 위임자 삭제시 NULL 처리
    UNIQUE KEY uk_doc_order (document_id, approval_order),                                 -- 문서별 결재순서 유일성 보장
    INDEX idx_approver_status (approver_id, approval_status),                             -- 결재자별 상태 조회용
    INDEX idx_delegated_status (delegated_to, approval_status),                           -- 위임받은 문서 조회용
    INDEX idx_doc_status_order (document_id, approval_status, approval_order),            -- 문서별 결재현황 조회용
    INDEX idx_processed_date (processed_at)                                               -- 처리시간 기준 조회용
);

-- 참조자 테이블: 문서 참조자/열람자 관리
CREATE TABLE document_references (
    reference_id INT AUTO_INCREMENT PRIMARY KEY,    -- 참조 고유 식별자
    document_id INT,                              -- 대상 문서 ID
    user_id INT,                                  -- 참조자 ID
    reference_type ENUM(
    'CC',                                     -- 참조자 (수신참조)
    'READER'                                  -- 열람자 (열람권한)
    ) DEFAULT 'CC',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,                 -- 참조 설정일시
    FOREIGN KEY (document_id) REFERENCES approval_documents(document_id) ON DELETE CASCADE,  -- 문서 삭제시 함께 삭제
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,                      -- 사용자 삭제시 함께 삭제
    INDEX idx_user_type (user_id, reference_type),                                          -- 사용자별 참조유형 조회용
    INDEX idx_doc_type (document_id, reference_type)                                        -- 문서별 참조자 조회용
);

-- 문서 이력 테이블: 모든 문서 관련 활동 이력 관리
CREATE TABLE document_history (
    history_id INT AUTO_INCREMENT PRIMARY KEY,     -- 이력 고유 식별자
    document_id INT,                              -- 대상 문서 ID
    actor_id INT,                                 -- 활동 수행자 ID
    action_type ENUM(
    'CREATED',                                -- 문서 생성
    'SUBMITTED',                              -- 결재 상신
    'APPROVED',                               -- 결재 승인
    'REJECTED',                               -- 결재 반려
    'DELEGATED',                              -- 결재 위임
    'RECEIVED'                                -- 결재 수신
    ) NOT NULL,
    action_comment TEXT,                          -- 활동 관련 코멘트
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP, -- 이력 생성일시
    FOREIGN KEY (document_id) REFERENCES approval_documents(document_id) ON DELETE CASCADE,  -- 문서 삭제시 함께 삭제
    FOREIGN KEY (actor_id) REFERENCES users(user_id) ON DELETE RESTRICT,                    -- 사용자 삭제 제한
    INDEX idx_doc_date (document_id, created_at),   -- 문서별 시간순 이력 조회용
    INDEX idx_actor_date (actor_id, created_at),    -- 사용자별 활동내역 조회용
    INDEX idx_action_date (action_type, created_at) -- 활동유형별 이력 조회용
);

2. 특정 사용자의 결재 대기 문서 조회 쿼리

SELECT
    ad.document_id AS documentId,
    ad.title AS title,
    u.username AS creatorName,
    u.department AS creatorDepartment,
    ad.created_at AS createdAt,
    al.approval_order AS approvalOrder,
    al.approval_status AS approvalStatus,
    al.received_at AS receivedAt,
    CASE
        WHEN al.delegated_to IS NOT NULL THEN '위임받은문서'
        WHEN al.approver_id = :current_user_id THEN '결재자'
    END AS approvalType
FROM approval_documents ad
JOIN approval_lines al ON ad.document_id = al.document_id
JOIN users u ON ad.creator_id = u.user_id
WHERE (
    al.approver_id = :current_user_id
    OR al.delegated_to = :current_user_id
)
AND al.approval_status IN ('WAITING', 'IN_PROGRESS')
AND ad.document_status = 'IN_PROGRESS'
AND NOT EXISTS (
SELECT 1
FROM approval_lines prev_al
WHERE prev_al.document_id = ad.document_id
    AND prev_al.approval_order < al.approval_order
    AND prev_al.approval_status != 'APPROVED'
)
ORDER BY
CASE al.approval_status
WHEN 'IN_PROGRESS' THEN 1
WHEN 'WAITING' THEN 2
ELSE 3
END,
createdAt DESC,
al.approval_order ASC;