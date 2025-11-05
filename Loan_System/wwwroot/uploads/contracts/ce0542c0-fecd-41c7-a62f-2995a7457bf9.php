<?php
include("include/dbcommon.php");

$servername = "10.5.50.100";
$username = "humanresourceuser";
$password = "humanresourceuser";
$dbname = "daeawaa";
$availableFields = [
    'dawa' => 'نوع الدعوى (رقم)',
    'daewa_no' => 'رقم الدعوى',
    'claimant' => 'المدعي',
    'Defendant' => 'المدعى عليه',
    'supject' => 'موضوع الدعوى',
    'dawa_type' => 'نوع الدعوى (تصنيف)',
    'office_name' => 'اسم المكتب',
    'cort' => 'المحكمة',
    'krarno' => 'رقم القرار',
    'krar_pic' => 'صورة القرار',
    'estanaf' => 'رقم الاستئناف',
    'estanaf_pic' => 'صورة الاستئناف',
    'tameezno' => 'رقم التمييز',
    'tameez_pic' => 'صورة التمييز',
    'tashehno' => 'رقم التصحيح',
    'tasheh_pic' => 'صورة التصحيح',
    'aadano' => 'رقم الإعادة',
    'aada_pic' => 'صورة الإعادة',
    'haladawaa' => 'حالة الدعوى',
    'last' => 'آخر إجراء',
    'notes' => 'ملاحظات',
    'update' => 'تاريخ التحديث',
    'username' => 'اسم المستخدم',
    'Adhbara' => 'أضبارة',
    'AdhbaraPic' => 'صورة الأضبارة',
    'DawaYear' => 'سنة الدعوى'
];

$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}
$UserType = $_SESSION["UserRights"][$_SESSION["UserName"]][".Groups"];
if ($UserType[0] != -1){
    header("Location: menu.php");
    exit;
}
if (isset($_POST['export'])) {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment;filename="legal_cases.csv"');
    $output = fopen('php://output', 'w');
    fputcsv($output, $selectedFields);
    foreach ($result as $row) {
        $line = [];
        foreach ($selectedFields as $field) {
            $line[] = $row[$field];
        }
        fputcsv($output, $line);
    }
    fclose($output);
    exit;
}

$selectedFields = isset($_POST['fields']) ? $_POST['fields'] : array_keys($availableFields);
$selectedFields = array_filter($selectedFields, function($field) use ($availableFields) {
    return array_key_exists($field, $availableFields);
});
$RecordNumber = isset($_POST['record_number']) ? (int)$_POST['record_number'] : 10;
$ChosenDep = isset($_POST['chosenDep']) ? $_POST['chosenDep'] : '';
if ($ChosenDep) {
    $sql = "SELECT * FROM daewaajzaa WHERE office_name = ? ORDER BY id DESC LIMIT ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("si", $ChosenDep, $RecordNumber);
} else {
    $sql = "SELECT * FROM daewaajzaa ORDER BY id DESC LIMIT ?";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("i", $RecordNumber);
}
$stmt->execute();
$result = $stmt->get_result();

function fetchLookupTable($conn, $table, $idColumn, $nameColumn) {
    $map = [];
    $sql = "SELECT $idColumn, $nameColumn FROM $table";
    $result = $conn->query($sql);

    if (!$result) {
        die("خطأ في جلب البيانات من جدول $table: " . $conn->error);
    }

    while ($row = $result->fetch_assoc()) {
        $map[$row[$idColumn]] = $row[$nameColumn];
    }

    return $map;
}

$shortDepartmentNames = [
    'مقر الوزارة' => 'الوزارة',
    'الهيأة العامة لتشغيل مشاريع الري و البزل' => 'التشغيل',
    'الهيأة العامة لصيانة مشاريع الري و البزل' => 'الصيانة',
    'الهيأة العامة لمشاريع الري والاستصلاح' => 'الري والاستصلاح',
    'الهيأة العامة للمساحة' => 'المساحة',
    'الهيأة العامة للمياه الجوفية' => 'المياه الجوفية',
    'الهيأة العامة للسدود والخزانات' => 'السدود',
    'مركز انعاش الاهوار والاراضي الرطبة العراقية' => 'الاهوار',
    'المركز الوطني لادارة الموارد المائية' => 'الإدارة الوطنية',
    'مركز الدراسات والتصاميم الهندسية' => 'التصاميم الهندسية',
    'مركز دراسات الموارد المائية لمشاريع المنطقة الشمالية' => 'موارد الشمال',
    'دائرة تنفيذ أعمال كري الأنهر' => 'كري الأنهر',
    'دائرة المصب العام' => 'المصب العام',
    'شركة الرافدين العامة لتنفيذ السدود' => 'الرافدين للسدود',
    'شركة العراق العامة لتنفيذ مشاريع الري' => 'العراق للري',
    'شركة الفاو العامة لتنفيذ مشاريع الري' => 'الفاو للري'
];

$departments = fetchLookupTable($conn, 'tashkelat', 'id', 'office_name');
$dawaTypes = fetchLookupTable($conn, 'dawatype', 'id', 'type_name');
$totalCasesQuery = $conn->query("SELECT COUNT(*) as total FROM daewaajzaa");
$totalCases = $totalCasesQuery->fetch_assoc()['total'];

$casesByOffice = [];
$res = $conn->query("SELECT office_name, COUNT(*) as total FROM daewaajzaa GROUP BY office_name");
while ($row = $res->fetch_assoc()) {
    $officeId = $row['office_name'];
    $name = isset($departments[$officeId]) ? $departments[$officeId] : 'غير محدد';
    $casesByOffice[$name] = $row['total'];
}
$recentUpdatedCases = [];
$res = $conn->query("
  SELECT daewa_no, claimant, Defendant, supject, office_name, `update`
  FROM daewaajzaa
  WHERE `update` >= CURDATE() - INTERVAL 30 DAY
  ORDER BY `update` DESC
");

if ($res && $res->num_rows > 0) {
    while ($row = $res->fetch_assoc()) {
        $recentUpdatedCases[] = $row;
    }
}

$casesByYear = [];
$res = $conn->query("SELECT DawaYear, COUNT(*) as total FROM daewaajzaa GROUP BY DawaYear ORDER BY DawaYear DESC");
while ($row = $res->fetch_assoc()) {
    $casesByYear[$row['DawaYear']] = $row['total'];
}

$haladawaaQuery = $conn->query("SELECT haladawaa, COUNT(*) as total FROM daewaajzaa GROUP BY haladawaa");
$casesByStatus = [];
while ($row = $haladawaaQuery->fetch_assoc()) {
    $casesByStatus[$row['haladawaa']] = $row['total'];
}
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة الدعاوى </title>
<link rel="stylesheet" href="./styles/dawaaReport.css" />
<link rel="stylesheet" href="./styles/SelectStyle.css" />

</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>نظام إدارة الدعاوى </h1>
            <div class="header-controls">
                <a href="/" class="btn btn-primary">الصفحة الرئيسية</a>
            </div>
        </div>

        <!-- Statistics -->
        <div class="stats-container">
            <div class="stat-card">
                <div class="stat-number"><?= $totalCases ?></div>
                <div class="stat-label">   إجمالي الدعاوى الجزائية</div>
            </div>
            
            <?php
$orderedStatuses = ['محسومة', 'غير محسومة', 'أغلقت'];
foreach ($orderedStatuses as $status):
    if (isset($casesByStatus[$status])):
?>
    <div class="stat-card">
        <div class="stat-number"><?= $casesByStatus[$status] ?></div>
        <div class="stat-label"><?= $status ?></div>
    </div>
<?php
    endif;
endforeach;
?>
            <div class="stat-card offices-card">
                <div class="stat-label">توزيع الدعاوى حسب التشكيل</div>
                <div class="offices-list">
                    <?php foreach($casesByOffice as $office => $count): ?>
                    <div class="office-item">
                        <span class="office-name"><?= $office ?></span>
                        <span class="office-count"><?= $count ?></span>
                    </div>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>

<div class="stat-card offices-card">
    <div class="stat-label">توزيع الدعاوى حسب سنة الدعوى</div>
    <div class="offices-list">
        <?php foreach($casesByYear as $year => $count): ?>
        <div class="office-item">
            <span class="office-name"><?= $year ?: 'غير محددة' ?></span>
            <span class="office-count"><?= $count ?></span>
        </div>
        <?php endforeach; ?>
    </div>
</div>

            

        <!-- Field Selection Form -->
        <form method="POST" class="fields-form">
            <h4>اختر الحقول التي تريد عرضها</h4>
            <div class="checkbox-grid">
                <?php foreach ($availableFields as $key => $label): ?>
                <div class="checkbox-item">
                    <input type="checkbox" name="fields[]" value="<?= $key ?>" id="field_<?= $key ?>" <?= in_array($key, $selectedFields) ? 'checked' : '' ?>>
                    <label for="field_<?= $key ?>"><?= $label ?></label>
                </div>
                <?php endforeach; ?>
            </div>
            <div style="text-align: center;">
                <button type="submit" class="btn btn-success">عرض الجدول</button>
                <label>
                    عدد السجلات المعروضة:
                    <input type="number" name="record_number" value="<?= $RecordNumber ?>" min="10" max="1000">
                </label>
                                    <div id="select" ng-model="" class="SelectStyle">
                    <select name="chosenDep">
                                        <option value=""> كل التشكيلات </option>
                        <?php foreach ($departments as $id => $office_name) : ?>
                            <option value="<?= htmlspecialchars($id) ?>">
                                <?= htmlspecialchars($office_name) ?>
                            </option>
                        <?php endforeach; ?>
                                    </select>
</div>
            </div>
        </form>


        <!-- Action Buttons -->
        <div class="action-buttons">
            <button type="button" class="btn btn-warning" onclick="printTable()">طباعة الجدول</button>
            <button type="button" class="btn btn-primary" onclick="exportToExcel()">تصدير إلى Excel</button>
            <button type="button" class="btn btn-danger" onclick="exportToPDF()">تصدير إلى PDF</button>
        </div>

        <!-- Data Table -->
        <div class="table-container" id="table-container">
            <table>
                <thead>
                    <tr>
                        <?php foreach ($selectedFields as $field): ?>
                        <th><?= $availableFields[$field] ?></th>
                        <?php endforeach; ?>
                    </tr>
                </thead>
                <tbody>
                    <?php while ($row = $result->fetch_assoc()): ?>
                    <tr>
                        <?php foreach ($selectedFields as $field): ?>
                        <td>
                            <?php 
                            switch ($field) {
                                case 'office_name':
                                    $deptFullName = isset($departments[$row[$field]]) ? $departments[$row[$field]] : 'غير معروف';
                                    echo isset($shortDepartmentNames[$deptFullName]) ? $shortDepartmentNames[$deptFullName] : $deptFullName;
                                    break;
                                case 'krar_pic':
                                case 'estanaf_pic':
                                case 'tameez_pic':
                                case 'tasheh_pic':
                                case 'aada_pic':
                                case 'AdhbaraPic':
                                    $pics = json_decode($row[$field], true);
                                    if (is_array($pics)) {
                                        foreach ($pics as $pic) {
                                            $filePath = htmlspecialchars($pic['name']);
                                            $fileName = htmlspecialchars($pic['usrName']);
                                            echo "<a href='$filePath' target='_blank' style='color: #2c5aa0; text-decoration: none;'>$fileName</a><br>";
                                        }
                                    } else {
                                        echo 'لا توجد ملفات';
                                    }
                                    break;
                                case 'dawa_type':
                                    echo isset($dawaTypes[$row[$field]]) ? $dawaTypes[$row[$field]] : 'غير معروف';
                                    break;
                                default:
                                    echo htmlspecialchars($row[$field] ? $row[$field] : '');
                            }
                            ?>
                        </td>
                        <?php endforeach; ?>
                    </tr>
                    <?php endwhile; ?>
                </tbody>
            </table>
        </div>
    </div>

    <script>
        function exportToExcel() {
            // Simple CSV export implementation
            let csv = '';
            const table = document.querySelector('table');
            const rows = table.querySelectorAll('tr');
            
            rows.forEach(row => {
                const cells = row.querySelectorAll('th, td');
                const rowData = Array.from(cells).map(cell => 
                    '"' + cell.textContent.replace(/"/g, '""') + '"'
                ).join(',');
                csv += rowData + '\n';
            });
            
            const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'legal_cases.csv';
            link.click();
        }

        function exportToPDF() {
            alert('ميزة تصدير PDF تتطلب مكتبة خاصة. يرجى استخدام خيار الطباعة في الوقت الحالي.');
            window.print();
        }

        function printTable() {
    // Get table HTML
    var table = document.getElementById("table-container").innerHTML;

    // Open a new window
    var newWin = window.open('', '', 'width=900,height=650');

    // Write table content with minimal styles
    newWin.document.write(`
        <html>
            <head>
                <title>طباعة الجدول</title>
                <style>
                    table { border-collapse: collapse; width: 100%; }
                    table, th, td { border: 1px solid black; padding: 8px; text-align: center; }
                </style>
            </head>
            <body>
                ${table}
            </body>
        </html>
    `);

    newWin.document.close();
    newWin.print();
}
    </script>
</body>
</html>

<?php $conn->close(); ?>